import React from 'react'
const time = 0.1
const TextElement = ({ text, backwards }) => {
  return <span className='type' style={{ '--n': text.length, '--time': `${time}s` }}>{text}</span>
}
export const getTextTimeout = (text) => text.length * time
export default TextElement