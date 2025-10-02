import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import { ScrollView } from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';
import { decode } from 'base64-arraybuffer';

import { supabase } from '../../libs/auth';
import PostCard, { Post } from '../../components/PostCard';
import { usePostStore } from '../../store/postStore';

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
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>에러가 발생했습니다: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }: { item: Post }) => <PostCard post={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>게시물이 아직 없습니다.</Text>
            <Text style={styles.emptyText}>첫 게시물을 작성해보세요!</Text>
          </View>
        )}
        refreshing={loading}
        onRefresh={fetchPosts}
      />

      {/* 글쓰기 버튼 (Floating Action Button) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* 글쓰기 모달 */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>새 게시물 작성</Text>
            <TextInput
              style={styles.input}
              placeholder='무슨 생각을 하고 있나요?'
              multiline
              value={content}
              onChangeText={setContent}
            />
            <ScrollView horizontal style={styles.imagePreviewContainer}>
              {selectedImages.map(image => (
                <View key={image.uri} style={styles.previewImageWrapper}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(image.uri!)}
                  >
                    <Text style={styles.removeImageText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>


            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handlePickImage}
            >
              <Text style={styles.addImageButtonText}>+ 이미지 추가</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
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
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center'
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#6200ee',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 150,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  addImageButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#eef0f2',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addImageButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    width: '100%',
    marginBottom: 15,
    minHeight: 100,
  },
  previewImageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default HomeScreen;
