import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';

// Post 데이터 타입 정의
// TODO: 추후 shared-types 패키지로 이동하여 공유 가능
interface PostImage {
  imageUrl: string;
  order: number;
}

export interface Post {
  id: string;
  content: string | null;
  // imageUrl: string | null;
  createdAt: string;
  userId: string;
  images: PostImage[];
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {

  const displayImage = post.images && post.images.length > 0 ? post.images[0] : null;

  return (
    <View style={styles.container}>
      {/* 사용자 정보 (임시)*/}
      <View style={styles.header}>
        <Text style={styles.author}>아티스트</Text>
        <Text style={styles.date}>
          {new Date(post.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* 게시물 내용 */}
      {post.content && <Text style={styles.content}>{post.content}</Text>}

      {displayImage && (
        <Image
          source={{ uri: displayImage.imageUrl }}
          style={styles.image}
          resizeMode='cover'
        />
      )}

      {/* 게시물 이미지 */}
      {/* {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  author: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    color: '#888',
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: Dimensions.get('window').width, // 정사각형 이미지
    borderRadius: 8,
    marginTop: 5,
  },
});

export default PostCard;
