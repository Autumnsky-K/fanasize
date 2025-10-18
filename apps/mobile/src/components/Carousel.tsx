import { FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { PostImage } from "./PostCard";
import styled from "styled-components/native";
import { useState } from "react";

interface CarouselProps {
  images: PostImage[];
  width?: number;
}

const Carousel = ({ images, width }: CarouselProps) => {
  const carouselWidth = width || Dimensions.get('window').width;
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent> ) => {
    const newPage = Math.round(
      e.nativeEvent.contentOffset.x / (width ?? 0)
    );
    setPage(newPage);
  }

  return (
    <Container>
      <FlatList
        automaticallyAdjustContentInsets={false}
        data={images}
        renderItem={({ item }: { item: PostImage }) => <Page url={item.imageUrl} width={carouselWidth}/>}
        keyExtractor={item => item.order.toString()}
        onScroll={onScroll}
        pagingEnabled={true}
        horizontal={true}
        refreshing={false}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
      />
      {images && images.length > 1 &&
        <IndicatorWrapper>
          {Array.from({length: images.length}, (_, i) => i).map((i) => (
            <Indicator key={images[i].imageUrl} focused={i === page} />
          ))}
        </IndicatorWrapper>
      }
      
    </Container>
  )
}

interface PageProps {
  url: string;
  width: number;
}

const Page = ({url, width} : PageProps) => {
  return (
    
    <PostImageStyled
      source={{ uri: url}}
      width={width}
    />
  )
}

export default Carousel;

const Container = styled.View`
  justify-content: center;
  align-items: center;
`;

const PostImageStyled = styled.Image<{width: number}>`
  width: ${props => props.width}px;
  height: ${props => props.width}px;
  border-radius: 8px;
`

const IndicatorWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
`;

const Indicator = styled.View<{focused: boolean}>`
  margin: 0px 4px;
  background-color: ${(props) => (props.focused ? '#262626' : '#dfdfdf')};
  width: 6px;
  height: 6px;
  border-radius: 3px;
`;
