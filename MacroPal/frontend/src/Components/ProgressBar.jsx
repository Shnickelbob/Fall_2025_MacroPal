import React from 'react'

const ProgressBar = ({label,bgcolor,height,part,total}) => {
   
    const labelText = {
        width: '100%',
        minWidth: '250px',
        maxWidth: '500px',
        color: 'white',
        textAlign: 'left'
      }

    const goalStatus = {
        width: '100%',
        color: 'white',
        textAlign: 'right'
      }

    const containerDiv = {
        height: height,
        width: '100%',
        backgroundColor: 'whitesmoke',
        borderRadius: 5,
        margin: 0
      }
      const progress2 = total > 0 ? (part / total) * 100 : 0;
    
      const innerDiv = {
        height: '100%',
        width: `${progress2}%`,
        backgroundColor: bgcolor,
       borderRadius:5,
        textAlign: 'right'
      }
    
      const progresstext = {
        padding: 10,
        color: 'black',
        fontWeight: 900
      }

      
    return (

    <div>
        <div style={labelText}>{`${label}`}</div>
        <div style={containerDiv}>
            <div style={innerDiv}>
                <span style={progresstext}></span>
            </div>
        </div>
        <div style={goalStatus}>{`${part} / ${total}`}</div>
    </div>
    )
}

export default ProgressBar;