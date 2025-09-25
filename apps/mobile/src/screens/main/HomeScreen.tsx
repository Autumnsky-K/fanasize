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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard, { Post } from '../../components/PostCard';
import { usePostStore } from '../../store/postStore';

const HomeScreen = () => {
  // Zustand 스토어에서 상태와 액션 가져오기
  const { posts, loading, error, fetchPosts, createPost } = usePostStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState('');

  // 컴포넌트 마운트 시 fetchPosts 액션 호출
  useEffect(() => {
    fetchPosts();
  }, []); // 빈 배열을 전달하여 한 번만 실행

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('내용을 입력하세요.');
      return;
    }
    await createPost(content);
    // 성공 후 모달 닫고 내용 초기화
    setContent('');
    setModalVisible(false);
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
            {/* TODO: 이미지 선택을 위한 UI 추가 필요 */}
            <View style={styles.modalButtons}>
              <Button title='취소' onPress={() => setModalVisible(false)} color='red' />
              <Button title='게시' onPress={handleCreatePost}/>
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
    alignItems: 'center',
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
    paddingBottom: 100,
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
});

export default HomeScreen;
