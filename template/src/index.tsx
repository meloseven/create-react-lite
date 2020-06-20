import React from 'react';
import './index.scss';

export interface IDemoProps {
  title: string;
}

export default function Demo(props: IDemoProps) {
  const { title } = props;
  return (
    <div className='demo'>
      <h2>This is demo from create-react-lite.</h2>
      <p>{title}</p>
    </div>
  );
}
