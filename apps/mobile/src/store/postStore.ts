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
      imageUrl
      createdAt
      userId
    }
  }
`;

const CREATE_POST_MUTATION = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
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
  createPost: (content: string) => Promise<void>;
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
  createPost: async (content: string) => {
    try {
      // TODO: 이미지 업로드 기능 구현. content와 함께 imageUrl도 인자로 받아 처리 필요.
      // 1. 이미지 선택 (Image Picker)
      // 2. 이미지 변환 (WebP) 및 supabase 스토리지에 업로드
      // 3. 업로드 된 이미지 URL을 아래 variables에 추가
      await client.mutate({
        mutation: CREATE_POST_MUTATION,
        variables: { content },
      });
      await get().fetchPosts();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('포스트를 게시하지 못했어요: ', e.message);
      }
    }
  }
}));