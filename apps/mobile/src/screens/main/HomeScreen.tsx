import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Button,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { decode } from 'base64-arraybuffer';
import styled from 'styled-components/native';

import { supabase } from '../../libs/auth';
import PostCard, { Post } from '../../components/PostCard';
import { usePostStore } from '../../store/postStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  // Zustand 스토어에서 상태와 액션 가져오기
  const { posts, loading, error, fetchPosts, createPost } = usePostStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 10, // 한 번에 최대 10장까지 선택 가능
    })

    // 사용자가 선택을 취소한 경우
    if (result.didCancel) {
      return;
    }
    if (result.errorCode || result.errorMessage) {
      Alert.alert('이미지 선택 중 오류가 발생했습니다.');
      return;
    }
    if (result.assets) {
      // 새로 선택한 이미지를 기존 목록에 추가
      setSelectedImages(prevImages => [...prevImages, ...result.assets!])
    }
  };

  const handleRemoveImage = (uriToRemove: string) => {
    setSelectedImages(prevImages => 
      prevImages.filter(image => image.uri !== uriToRemove),
    );
  };
  
  // 컴포넌트 마운트 시 fetchPosts 액션 호출
  useEffect(() => {
    fetchPosts();
  }, []); // 빈 배열을 전달하여 한 번만 실행

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('내용을 입력하세요.');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('이미지를 1개 이상 선택하세요.');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrls: string[] = [];
      // 선택된 이미지를 순회하며 Supabase에 업로드
      for (const image of selectedImages) {
        if (!image.uri || !image.fileName)
          continue;

        const fileExt = image.fileName.split('.').pop();
        const filePath = `${Date.now()}.${fileExt}`;

        // base64로 파일 읽기
        const base64Data = await RNFS.readFile(image.uri, 'base64');

        // base64를 ArrayBuffer로 변환
        const arrayBuffer = decode(base64Data);

        // Supabase 스토리지에 업로드
        const { error } = await supabase
          .storage
          .from('posts')
          .upload(
            filePath,
            arrayBuffer,
            {
              contentType: image.type || 'image/jpeg',
              upsert: false,
            });
        
        if (error) {
          throw new Error(`이미지 업로드 실패: ${error.message}`);
        }

        // 업로드된 이미지의 공개 URL 가져오기
        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);
        
        imageUrls.push(urlData.publicUrl);
      }

      await createPost(content, imageUrls);

      Alert.alert('성공', '게시물이 성공적으로 작성되었습니다.');
      // 성공 후 모달 닫고 내용 초기화
      setContent('');
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('오류', error.message || '게시물 작성 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  }

  // 초기 데이터 로딩 시에만 전체 화면 로딩 인디케이터 표시
  if (loading && posts.length === 0) {
    return (
      <Centered>
        <ActivityIndicator size="large" />
      </Centered>
    );
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <Centered>
        <Text>에러가 발생했습니다: {error}</Text>
      </Centered>
    );
  }

  return (
    <SafeArea>
      <FlatList
        data={posts}
        renderItem={({ item }: { item: Post }) => <PostCard post={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <EmptyContainer>
            <EmptyText>게시물이 아직 없습니다.</EmptyText>
            <EmptyText>첫 게시물을 작성해보세요!</EmptyText>
          </EmptyContainer>
        )}
        refreshing={loading}
        onRefresh={fetchPosts}
      />

      {/* 글쓰기 버튼 (Floating Action Button) */}
      <Fab onPress={() => setModalVisible(true)}>
        <FabText>+</FabText>
      </Fab>

      {/* 글쓰기 모달 */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalContainer
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ModalView>
            <ModalTitle>새 게시물 작성</ModalTitle>
            <Input
              placeholder='무슨 생각을 하고 있나요?'
              multiline
              value={content}
              onChangeText={setContent}
            />
            <ImagePreviewContainer horizontal>
              {selectedImages.map(image => (
                <PreviewImageWrapper key={image.uri}>
                  <PreviewImage source={{ uri: image.uri }} />
                  <RemoveImageButton
                    onPress={() => handleRemoveImage(image.uri!)}
                  >
                    <RemoveImageText>X</RemoveImageText>
                  </RemoveImageButton>
                </PreviewImageWrapper>
              ))}
            </ImagePreviewContainer>

            <AddImageButton onPress={handlePickImage}>
              <AddImageButtonText>+ 이미지 추가</AddImageButtonText>
            </AddImageButton>

            <ModalButtons>
              <Button
                title='취소'
                onPress={() => setModalVisible(false)}
                color='red'
              />
              <Button
                title={isUploading ? '업로드 중...' : '게시'}
                onPress={handleCreatePost}
                disabled={isUploading}
              />
            </ModalButtons>
          </ModalView>
        </ModalContainer>
      </Modal>
    </SafeArea>
  );
};

const SafeArea = styled(SafeAreaView)`
  flex: 1;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
`;

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ListContent = styled.View`
  padding: 10px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #888;
  text-align: center;
`;

const Fab = styled(TouchableOpacity).attrs({
  style: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
})`
  position: absolute;
  right: 30px;
  bottom: 30px;
  background-color: #6200ee;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
`;

const FabText = styled.Text`
  font-size: 30px;
  color: #fff;
  line-height: 32px;
`;

const ModalContainer = styled(KeyboardAvoidingView)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalView = styled(View).attrs({
  style: {
    elevation: 5,
  }
})`
  width: 90%;
  background-color: #fff;
  border-radius: 20px;
  padding: 20px;
  align-items: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
`;

const Input = styled.TextInput`
  width: 100%;
  height: 150px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  vertical-align: top;
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 24px;
`;

const ModalButtons = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
`;

const AddImageButton = styled.TouchableOpacity`
  width: 100%;
  padding: 15px;
  background-color: #eef0f2;
  border-radius: 10px;
  align-items: center;
  margin-bottom: 20px;
`;

const AddImageButtonText = styled.Text`
  font-size: 16px;
  color: #555;
  font-weight: bold;
`;

const ImagePreviewContainer = styled.ScrollView`
  width: 100%;
  margin-bottom: 15px;
  min-height: 100px;
`;

const PreviewImageWrapper = styled.View`
  position: relative;
  margin-right: 10px;
`;

const PreviewImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 10px;
  background-color: #eee;
`;

const RemoveImageButton = styled.TouchableOpacity`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const RemoveImageText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 12px;
`;

const styles = StyleSheet.create({
  listContent: {
    padding: 10,
  },
});

export default HomeScreen;
