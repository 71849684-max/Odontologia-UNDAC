import React from 'react';

export default function Subheading({ children, hint }) {
  return <div className="undac-subheading"><h4>{children}</h4>{hint ? <span>{hint}</span> : null}</div>;
}
