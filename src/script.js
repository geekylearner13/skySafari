import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

// initialize pane
const pane = new Pane();

// initialize the scene
const scene = new THREE.Scene();

// add texture loader
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
cubeTextureLoader.setPath("/textures/cubeMap/")

// adding textures

const sunTexture = textureLoader.load("/textures/2k_sun.jpg")
const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg")
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg")
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg")
const moonTexture = textureLoader.load("/textures/2k_moon.jpg")
const marsTexture = textureLoader.load("/textures/2k_mars.jpg")

const backgroundCubemap = cubeTextureLoader.load([
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png"
]);
scene.background = backgroundCubemap
// adding material

const mercuryMaterial = new THREE.MeshStandardMaterial(
  {
    map:mercuryTexture
  }
)
const venusMaterial = new THREE.MeshStandardMaterial(
  {
    map:venusTexture
  }
)
const earthMaterial = new THREE.MeshStandardMaterial(
  {
    map:earthTexture
  }
)
const moonMaterial = new THREE.MeshStandardMaterial(
  {
    map:moonTexture
  }
)
const marsMaterial = new THREE.MeshStandardMaterial(
  {
    map:marsTexture
  }
)


// add stuff here
const sphereGeometry = new THREE.SphereGeometry(5,32,32)
const sunMaterial = new THREE.MeshBasicMaterial({
  map:sunTexture
})

const sun = new THREE.Mesh(
  sphereGeometry,
  sunMaterial
)
sun.scale.setScalar(1.8)
scene.add(sun)

const planets = [
  {
    name:"Mercury",
    radius:0.25,
    distance:15,
    speed:0.065,
    material: mercuryMaterial,
    moons: [],
  },
  {
    name:"Venus",
    radius:0.50,
    distance:30,
    speed:0.07,
    material: venusMaterial,
    moons: [],
  },
  {
    name:"Earth",
    radius:0.6,
    distance:45,
    speed:0.05,
    material: earthMaterial,
    moons: [
      {
        name:"Moon",
        radius: 0.5,
        distance:15,
        speed:0.015
      }
    ]
  },
  {
    name:"Mars",
    radius:0.45,
    distance:60,
    speed:0.03,
    material: marsMaterial,
    moons: [
      {
        name:"Phobos",
        radius:0.3,
        distance:15,
        speed:0.02,
      },
      {
        name:"Deimos",
        radius:0.4,
        distance:25,
        speed:0.015,
        color:0xffffff
      }
    ],
  },
];

const createPlanet = (planet) => {
  // create the planet and add it to the scene
  const planetMesh = new THREE.Mesh(
    sphereGeometry,
    planet.material
  )
  // set the scale
  planetMesh.scale.setScalar(planet.radius)
  planetMesh.position.x = planet.distance
  return planetMesh
}

const createMoon = (moon) =>{
  // create the moon and add it to the scence
  const moonMesh = new THREE.Mesh(
    sphereGeometry,
    moonMaterial
  )
  moonMesh.scale.setScalar(moon.radius)
  moonMesh.position.x = moon.distance
  return moonMesh
}

const planetMeshes = planets.map((planet) => {
  const planetMesh  = createPlanet(planet)
  // add to the scene
  scene.add(planetMesh)
  // loop through each moon and create the moon
  planet.moons.forEach((moon) => {
    const moonMesh = createMoon(moon)
    planetMesh.add(moonMesh)
  })
  return planetMesh
})
console.log(planetMeshes)
// add the lights
const ambientLights = new THREE.AmbientLight(
  0xffffff,
  0.13
)
scene.add(ambientLights)

const pointLight = new THREE.PointLight(
  0xffffff,
  2
)
scene.add(pointLight)

// initialize the camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.z = 100;
camera.position.y = 5;

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( '/textures/low-spaceship-rumble-195722.ogg', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});

// initialize the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// add controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20

// add resize listener
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// render loop
const renderloop = () => {
  planetMeshes.forEach((planet,index)=>{
    planet.rotation.y += 0.1*planets[index].speed
    planet.position.x = Math.sin(planet.rotation.y)* planets[index].distance
    planet.position.z = Math.cos(planet.rotation.y)* planets[index].distance
    planet.children.forEach((moon,moonIndex)=>{
      moon.rotation.y += planets[index].moons[moonIndex].speed
      moon.position.x = Math.sin(moon.rotation.y)*planets[index].moons[moonIndex].distance
      moon.position.z = Math.cos(moon.rotation.y)*planets[index].moons[moonIndex].distance
    })
  })

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};


renderloop();
