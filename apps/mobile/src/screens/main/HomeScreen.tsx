import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import PostCard, { Post } from '../../components/PostCard';

// 백엔드에 요청할 listPosts 쿼리 정의
const LIST_POSTS_QUERY = gql`
  query ListPosts {
    listPosts {
      id
      content
      image_url
      created_at
      user_id
    }
  }
`;

interface ListPostData {
  listPosts: Post[];
}

const HomeScreen = () => {
  // useQuery 훅 사용하여 백엔드에 쿼리 요청
  const { data, loading, error } = useQuery<ListPostData>(LIST_POSTS_QUERY);

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
        <Text>에러가 발생했습니다: {error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data?.listPosts || []}
        renderItem={({ item }: { item: Post }) => <PostCard post={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
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
});

export default HomeScreen;
