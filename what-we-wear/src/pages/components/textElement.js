import React from 'react'
const TextElement = ({ text, backwards }) => {
  return <span className='type' style={{ '--n': text.length }}>{text}</span>
}
export default TextElement