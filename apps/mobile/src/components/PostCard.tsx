import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import styled from 'styled-components/native';

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
    <Container>
      {/* 사용자 정보 (임시)*/}
      <Header>
        <Author>아티스트</Author>
        <DateText>
          {new Date(post.createdAt).toLocaleDateString()}
        </DateText>
      </Header>

      {/* 게시물 내용 */}
      {post.content && <Content>{post.content}</Content>}

      {/* 게시물 이미지 */}
      {displayImage && (
        <PostImageStyled
          source={{ uri: displayImage.imageUrl }}
          resizeMode='cover'
        />
      )}
    </Container>
  );
};

const Container = styled.View`
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Author = styled.Text`
  font-weight: bold;
  font-size: 16px;
`;

const DateText = styled.Text`
  color: #888;
  font-size: 12px;
`;

const Content = styled.Text`
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 10px;
`;

const PostImageStyled = styled.Image`
  width: 100%;
  height: ${Dimensions.get(`window`).width}px;
  border-radius: 8px;
  margin-top: 5px;
`;

export default PostCard;
