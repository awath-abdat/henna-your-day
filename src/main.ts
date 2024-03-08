import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { bodyFontUrl, modelUrl } from "./assets/assets";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, -400, 600);
// const light = new THREE.SpotLight(0xffffff);
// light.position.set(2, 2, 2);
// scene.add(light)

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const fontLoader = new FontLoader();
fontLoader.load(bodyFontUrl, function (font) {
	const color = 0xff0000;

	const matDark = new THREE.LineBasicMaterial({
		color: color,
		side: THREE.DoubleSide,
	});

	const matLite = new THREE.MeshBasicMaterial({
		color: color,
		transparent: true,
		opacity: 0.4,
		side: THREE.DoubleSide,
	});

	const message = "Henna Your Day";
	const shapes = font.generateShapes(message, 100);
	const geometry = new THREE.ShapeGeometry(shapes);
	geometry.computeBoundingBox();
	if (geometry.boundingBox === null) return;

	const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
	geometry.translate(xMid, 0, 0);
	// make shape (N.B. edge view not visible)
	const text = new THREE.Mesh(geometry, matLite);
	text.position.z = -150;
	scene.add(text);
	// make line shape (N.B. edge view remains visible)
	const holeShapes: THREE.Shape[] = [];
	for (let i = 0; i < shapes.length; i++) {
		const shape = shapes[i];
		if (shape.holes.length > 0) {
			for (let j = 0; j < shape.holes.length; j++) {
				const hole = shape.holes[j];
				holeShapes.push(new THREE.Shape(hole.getPoints()));
			}
		}
	}
	shapes.push(...holeShapes);
	const lineText = new THREE.Object3D();
	for (let i = 0; i < shapes.length; i++) {
		const shape = shapes[i];
		const points = shape.getPoints();
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		geometry.translate(xMid, 0, 0);
		const lineMesh = new THREE.Line(geometry, matDark);
		lineText.add(lineMesh);
	}
	scene.add(lineText);
	renderer.render(scene, camera);
	// render();
});

const loader = new GLTFLoader();

loader.load(
	modelUrl,
	function (gltf) {
    gltf.scene.scale.set(100, 100, 100);
		gltf.scene.rotateZ(-Math.PI / 2);
		gltf.scene.rotateX(Math.PI / 2);
		scene.add(gltf.scene);
	},
	undefined,
	function (error) {
		console.error(error);
	},
);

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();
