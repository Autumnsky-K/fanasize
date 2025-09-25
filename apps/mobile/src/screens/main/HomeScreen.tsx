import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard, { Post } from '../../components/PostCard';
import { usePostStore } from '../../store/postStore';

const HomeScreen = () => {
  // Zustand 스토어에서 상태와 액션 가져오기
  const { posts, loading, error, fetchPosts } = usePostStore();

  // 컴포넌트 마운트 시 fetchPosts 액션 호출
  useEffect(() => {
    fetchPosts();
  }, []); // 빈 배열을 전달하여 한 번만 실행

  // 로딩 중일 때 로딩 인디케이터 표시
  if (loading) {
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
      />
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  }
});

export default HomeScreen;
