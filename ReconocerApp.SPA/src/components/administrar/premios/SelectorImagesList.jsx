import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

export default function SelectorImagesList({ data }) {
  return (
    <ImageList sx={{ width: 500, height: 450 }}>
      {data.map((item, index) => (
        <ImageListItem key={index}>
          <img
            src={`${item.img}?w=248&fit=crop&auto=format`}
            srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
            alt={item.nombre}
            loading="lazy"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}
