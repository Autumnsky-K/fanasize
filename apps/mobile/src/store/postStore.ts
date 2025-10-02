import { create } from "zustand";
import { gql } from "@apollo/client";
import { client } from "../libs/apollo";
import { Post } from "../components/PostCard";

// 백엔드에 요청할 listPosts 쿼리 정의
const LIST_POSTS_QUERY = gql`
  query ListPosts {
    listPosts {
      id
      content
      createdAt
      userId
      images {
        imageUrl
        order
      }
    }
  }
`;

const CREATE_POST_MUTATION = gql`
  mutation CreatePost($content: String!, $imageUrls: [String!]!) {
    createPost(content: $content, imageUrls: $imageUrls) {
      id
    }
  }
`;

interface ListPostData {
  listPosts: Post[];
}

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  createPost: (content: string, imageUrls: string[]) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await client.query<ListPostData>({
        query: LIST_POSTS_QUERY,
        // 항상 최신 데이터를 가져오기 위해 'network-only' 정책 사용
        fetchPolicy: 'network-only',
      });

      // 성공 시, listPosts 데이터를 내림차순(최신순)으로 정렬하여 상태 업데이트
      const sortedPosts = [...(data?.listPosts || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      set({ posts: sortedPosts, loading: false });
    } catch (e: unknown) {
      if (e instanceof Error) {
        set({ error: e.message, loading: false });
      } else {
        set({ error: '알 수 없는 오류가 발생했습니다.', loading: false });
      }
    }
  },
  createPost: async (content: string, imageUrls: string[]) => {
    try {
      await client.mutate({
        mutation: CREATE_POST_MUTATION,
        variables: { content, imageUrls },
      });
      // 성공 후 게시물 목록을 새로고침하여 방금 작성한 글을 바로 확인
      await get().fetchPosts();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('포스트를 게시하지 못했어요: ', error.message);
      }
      console.log(error);
      throw new Error('알 수 없는 오류로 게시물 작성에 실패했습니다.')
    }
  }
}));