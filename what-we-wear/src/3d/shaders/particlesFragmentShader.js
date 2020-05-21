export default 'uniform sampler2D pointTexture;\
                varying vec3 vColor;\
                void main() {\
                gl_FragColor = vec4( vColor, 0.8 );\
                gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord ); \
                }';