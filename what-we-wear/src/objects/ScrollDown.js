import React from 'react';
import text from "../dictionary/en.json";
export default function ScrollDown(props){
    return (<div className="informativeButton button" id={props.buttonId}>
        <p>{text.buttons.scroll}</p>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
	 viewBox="0 0 512 512" >
            
            <g>
                <g>
                    <path className="animatedStroke" d="M344.584,15.743C316.262,5.297,286.458,0,256,0C187.62,0,123.333,26.629,74.98,74.98C26.629,123.333,0,187.62,0,256
                        c0,51.364,15.155,100.913,43.828,143.288c27.977,41.349,67.005,73.417,112.863,92.735c0.953,0.401,1.941,0.591,2.914,0.591
                        c2.932,0,5.719-1.727,6.929-4.599c1.611-3.824-0.183-8.231-4.008-9.843c-43.168-18.185-79.909-48.375-106.25-87.305
                        C29.292,350.987,15.029,304.351,15.029,256c0-64.365,25.065-124.879,70.579-170.392C131.121,40.095,191.635,15.03,256,15.03
                        c28.677,0,56.731,4.984,83.383,14.814c3.894,1.437,8.215-0.556,9.651-4.45C350.47,21.5,348.478,17.179,344.584,15.743z"/>
                </g>
            </g>
            <g>
                <g>
                    <path className="animatedStroke" d="M473.068,120.227c-24.773-39.525-59.819-71.56-101.351-92.64c-3.701-1.878-8.224-0.402-10.102,3.3
                        c-1.878,3.701-0.401,8.224,3.3,10.102c39.099,19.846,72.094,50.006,95.418,87.22c23.968,38.241,36.637,82.431,36.637,127.792
                        c0,64.365-25.065,124.878-70.579,170.392C380.879,471.905,320.365,496.97,256,496.97c-21.795,0-43.395-2.908-64.199-8.644
                        c-3.998-1.101-8.138,1.247-9.242,5.248c-1.103,4.001,1.247,8.138,5.248,9.242C209.912,508.91,232.856,512,256,512
                        c68.38,0,132.667-26.628,181.02-74.98C485.371,388.667,512,324.38,512,256C512,207.813,498.538,160.863,473.068,120.227z"/>
                </g>
            </g>
            <g>
                    <g id="rotateDown">
                        <path  d="M327.816,250.813L222.44,154.074c-3.059-2.807-7.812-2.604-10.617,0.454c-2.807,3.058-2.604,7.811,0.453,10.618
                            l99.346,91.204l-98.587,90.507c-3.055,2.805-3.259,7.558-0.452,10.616c1.481,1.615,3.506,2.432,5.537,2.432
                            c1.816,0,3.637-0.655,5.08-1.979l104.616-96.042c1.55-1.423,2.432-3.431,2.432-5.535
                            C330.248,254.244,329.365,252.236,327.816,250.813z"/>
                    </g>
                </g>
          

            </svg>

    </div>)
}