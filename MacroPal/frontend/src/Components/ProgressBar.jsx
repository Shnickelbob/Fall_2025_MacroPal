import React from 'react'

const ProgressBar = ({ label, bgcolor, height, part, total }) => {
  const progress = total > 0 ? (part / total) * 100 : 0;
  const clamped = Math.min(progress, 100);
  const isDone = progress >= 100;

  const labelText = {
    width: '100%',
    minWidth: '250px',
    maxWidth: '500px',
    color: 'white',
    textAlign: 'left'
  };

  const goalStatus = {
    width: '100%',
    color: 'white',
    textAlign: 'right'
  };

  const containerDiv = {
    height,
    width: '100%',
    backgroundColor: 'whitesmoke',
    borderRadius: 5,
    margin: 0,
    overflow: 'hidden',
    position: 'relative'
  };

  const innerDiv = {
    height: '100%',
    width: `${clamped}%`,
    backgroundColor: bgcolor,
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: isDone ? 'center' : 'flex-start',
    transition: 'width 0.4s ease-in-out'
  };

  const progressText = {
    paddingLeft: isDone ? 0 : 10,
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.9rem',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  };

  return (
    <div aria-label={`${label} progress`} role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
      <div style={labelText}>{label}</div>
      <div style={containerDiv}>
        <div style={innerDiv}>
          <span style={progressText}>
            {isDone ? 'Goal Completed' : `${Math.round(clamped)}%`}
          </span>
        </div>
      </div>
      <div style={goalStatus}>{`${part} / ${total}`}</div>
    </div>
  );
};

export default ProgressBar;
