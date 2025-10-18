import React, { useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import Carousel from './Carousel';
import { LayoutChangeEvent } from 'react-native';

// Post 데이터 타입 정의
// TODO: 추후 shared-types 패키지로 이동하여 공유 가능
export interface PostImage {
  imageUrl: string;
  order: number;
}

interface Profile {
  id: string;
  handle: string;
  username: string | null;
  avatarUrl: string | null;
}

export interface Post {
  id: string;
  content: string | null;
  createdAt: string;
  userId: string;
  images: PostImage[];
  author: Profile;
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  // TODO: 실제 좋아요 데이터 연결 필요
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100));
  const [carouselContainerWidth, setCarouselContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setCarouselContainerWidth(width);
  }
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const displayName = post.author?.username || post.author?.handle;

  const displayAvatar = post.author?.avatarUrl
                          ? { uri: post.author.avatarUrl }
                          : require('../../assets/default-avatar.png');

  return (
    <Container>
      {/* 사용자 정보 (임시)*/}
      <Header>
        <HeaderLeft>
          <Avatar source={displayAvatar} />
          <View>
            <AuthorName>{displayName}</AuthorName>
            <DateText>{formatDate(post.createdAt)}</DateText>
          </View>
        </HeaderLeft>
        <TouchableOpacity>
          <MoreIcon>···</MoreIcon>
        </TouchableOpacity>
      </Header>

      {/* 게시물 내용 */}
      {post.content && <Content>{post.content}</Content>}

      {/* 게시물 이미지 */}
      {/* {displayImage && (
        <PostImageStyled
          source={{ uri: displayImage.imageUrl }}
          resizeMode='cover'
        />
      )} */}

      <View onLayout={handleLayout}>
        {carouselContainerWidth > 0 && post.images && post.images.length > 0 && (
          <Carousel
            images={post.images}
            width={carouselContainerWidth}
          />
        )}
      </View>

      <Actions>
        <ActionGroup>
          <ActionButton onPress={handleLike}>
            <ActionButtonContent>
              <ActionIcon isLiked={isLiked}>♥</ActionIcon>
              <ActionText isLiked={isLiked}>{`${likeCount}`}</ActionText>
            </ActionButtonContent>
          </ActionButton>
          <ActionButton>
            <ActionButtonContent>
              <ActionIcon>💬</ActionIcon>
              <ActionText>{Math.floor(Math.random() * 50)}</ActionText>
            </ActionButtonContent>
          </ActionButton>
          <ActionButton>
            <ActionButtonContent>
              <ActionIcon>↪</ActionIcon>
              <ActionText>{Math.floor(Math.random() * 20)}</ActionText>
            </ActionButtonContent>
          </ActionButton>
        </ActionGroup>
      </Actions>
    </Container>
  );
};

const Container = styled.View`
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-width: 1px;
  border-color: #e0e0e0;
  border-radius: 8px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
  overflow: hidden;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border-width: 1px;
  border-color: #eee;
  background-color: #eee;
`;

const AuthorName = styled.Text`
  font-weight: 600;
  font-size: 15px;
  color: #1c1c1c;
`;

const DateText = styled.Text`
  color: #888;
  font-size: 12px;
  margin-top: 2px;
`;

const Content = styled.Text`
  font-size: 15px;
  line-height: 22px;
  padding: 0 12px 12px 12px;
  color: #333;
`;

const Actions = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
`;

const ActionGroup = styled.View`
  flex-direction: row;
  gap: 24px;
`;

const ActionButton = styled.TouchableOpacity``;

const ActionIcon = styled.Text<{ isLiked?: boolean }>`
  font-size: 20px;
  color: ${props => (props.isLiked ? '#ff4d4d' : '#555')};
`;

const ActionText = styled.Text<{ isLiked?: boolean }>`
  font-size: 13px;
  color: ${props => (props.isLiked ? '#ff4d4d' : '#555')};
  font-weight: 500;
  margin-left: 6px;
`;

const ActionButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
`;

const MoreIcon = styled.Text`
  font-size: 16px;
  color: #555;
`;

export default PostCard;
