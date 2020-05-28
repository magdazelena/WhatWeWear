export default 'precision highp float;\
\
uniform float time;\
\
varying vec3 vPosition;\
varying vec4 vColor;\
\
void main() {\
\
    vec4 color = vec4( vColor );\
    color.b += sin( vPosition.x * 180.0 + time ) * 0.5;\
    color.r -= sin( vPosition.y * 1.0 +time ) * 0.1;\
    color.g -= sin( vPosition.z * 2.0 +time) * 0.1;\
    gl_FragColor = color;\
\
}';