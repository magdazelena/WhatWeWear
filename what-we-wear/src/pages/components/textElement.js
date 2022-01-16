import React from 'react'
const time = 0.02
const TextElement = ({ text }) => {
  if (!text) return <></>
  return <span className='type' style={{ '--n': text.length, '--time': `${time}s` }}>{text}</span>
}
export const getTextTimeout = (text) => text.length * time
export default TextElement