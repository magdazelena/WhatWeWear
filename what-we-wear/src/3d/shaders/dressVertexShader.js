export default `#include <morphtarget_pars_vertex>

void main()	{

    #include <begin_vertex>
    #include <morphtarget_vertex>

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
`