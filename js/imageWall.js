/*
* @Author: Iris Hu
* @Date:   2017-01-09 17:53:29
* @Last Modified by:   Iris Hu
* @Last Modified time: 2017-02-07 16:24:09
*/


/*
 *canvas是获取的dom元素
 *cameraPositionZ:设置照相机在z轴上的位置
 *lightColor：设置灯光的颜色
 *img：width、height设置小图片默认的宽和长
 *img:range设置图片随机显示的范围系数，x,y是正负系数，z是0-定义的系数
 */

var ImageWall = function(attr){

	var renderer,
			scene,
			camera,
			light,
			canvas,
			w,h,
			geometry,
			materials = [],
			parameters,
			particles,
			objects = [],
			completeImages = [],
			isCameraRotated = false,
			isWavesMove = false,
			isCompoundIn = false;

	var imgWidth = attr.tileImg.width,
			imgHeight = attr.tileImg.height,
			// data = attr.parameters;
			data = [],
			compoundData = attr.compoundImg.data,
			compoundTexture = [];

	// 定义合成变量
	var compound = {
		mesh:null,
		texture:[],
		material:null,
		data:attr.compoundImg.data,
		indexNow:0
	}


	var api = {};

	var targets = {table:[],sphere:[],helix:[],grid:[],waves:[],orgin:[],compound:[]};
			targets.name = ['sphere','helix','grid','waves'];

	var tileSize = {
		width:80,
		height:80
	};

	// 测试用，生成数据
	var images = {
		dataLength:1000,
		loop:1
	}
	for (var i = 0; i < images.dataLength; i++) {
		// data[i] = {tilePath:'assets/100-100/1-' + (i+1)%100 + '.jpg',name:'tile'+i+'.jpg'};
		data[i] = {tilePath:'tiles/bmp/tile' + i%1842 + '.jpg',name:'tile'+i+'.jpg'};
	}
	


	// 设置canvas
	canvas = attr.canvas;
	w = canvas ? canvas.clientWidth : window.innerWidth;
	h = canvas ? canvas.clientHeight : window.innerHeight;

	// 定义renderer
	renderer = new THREE.WebGLRenderer({
		canvas:canvas
	});
	renderer.setSize(w , h);
 

	// 定义场景
	scene = new THREE.Scene;

	// 透视照相机
	camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
	camera.position.set(0, 0, attr.cameraPositionZ);
	camera.lookAt(new THREE.Vector3()); 
	scene.add(camera);    //camera必须添加到scene中

	// 定义全局灯光
	light = new THREE.AmbientLight(attr.lightColor);
	scene.add(light);	

	// tile
	var geometry = new THREE.PlaneBufferGeometry( imgWidth, imgHeight );


	// 定义合成的大图
	var compoundPlane = new THREE.PlaneBufferGeometry(attr.compoundImg.width,attr.compoundImg.height);
	var compoundMaterial = new THREE.MeshBasicMaterial({map:addImage(compoundData[0]),side:THREE.DoubleSide,opacity:0,transparent:true});
	compound.mesh = new THREE.Mesh(compoundPlane,compoundMaterial);
	compound.mesh.material.needsUpdate = true;
	compound.mesh.scale.y = 0;
	scene.add(compound.mesh);

	function random(min,max){
		return ((max - min) * Math.random() + min);
	}


	function addImage(img,func){

		var bitmap = new Image();
    bitmap.src = img.tilePath; // Pre-load the bitmap, in conjunction with the Start button, to avoid any potential THREE.ImageUtils.loadTexture async issues.
    bitmap.onload = function(){
    	if (func && typeof func === 'function') 
    		func(texture);
    	else
    		completeImages.push(img);
    }

    var texture = new THREE.Texture( bitmap );
		texture.needsUpdate = true;

		return texture;
	}

	// 初始化时加载已分析好的图片
	function loadAutoModeCompoundImg(){
		compound.data.map(function(d){
			addImage(d,function(texture){
				compound.texture.push(texture);
			});
		});
	}

	// 循环创建粒子系统
	function createPoint(d){
		var j = 0;
		while(j++ < images.loop){				

				for ( i = 0; i < d.length; i ++ ) {
				var size  = 50;
				var list = d[i];

				// 创建Points
				// geometry = new THREE.Geometry();
				// var vertex = new THREE.Vector3();
				// vertex.x = Math.random() * 2000 - 1000;
				// vertex.y = Math.random() * 2000 - 1000;
				// vertex.z = Math.random() * 2000 - 1000;
				// geometry.vertices.push( vertex );

				
				// particles = new THREE.Points( geometry, materials[i] );
				

				//普通创建Plene

				if (materials.length != d.length){
					var sprite = addImage(list);
					materials[i] = new THREE.MeshBasicMaterial( { map: sprite,side:THREE.DoubleSide } );
					// materials[i] = new THREE.PointsMaterial( { size: size , map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : false } );
					materials[i].name = list.name;
				} 		
					
				createParticles(geometry,materials[i]);
				
			}
		}

		createModelPositon();

		loadAutoModeCompoundImg();

		window.addEventListener( 'resize', onWindowResize, false );

	}

	// 创建单个粒子
	function createParticles(geometry, material){
		// var particles = new THREE.Points( geometry, material );
		var particles = new THREE.Mesh( geometry, material );

		particles.rotation.x = Math.random() * 0.1 - 0.2;
		particles.rotation.y = Math.random() * 0.1 - 0.2;
		particles.rotation.z = Math.random() * 0.1 - 0.2;

		particles.position.x = Math.random() * 4000 - 2000;
		particles.position.y = Math.random() * 4000 - 2000;
		particles.position.z = Math.random() * 2000 + 4000;
		// particles.position.z = Math.random() * 4000 - 2000;

		particles.name = material.name;

		objects.push(particles);
			
		scene.add( particles );
	}

	// 设置table展现形式的位置
	function setTablePosition(obj){

		targets.table = [];
		var index,
				z = -4000;

		for (var i = 0; i < objects.length ; i++) {

	    var object = new THREE.Object3D();

	    index = i;

	    if (obj) {
	    	var j = 0,
	    			objTemp = $.extend(obj),
	    			isFind = false;

	    	while(j < objTemp.length){

	    		if (objects.name === objTemp.name) {
	    			index = j;
	    			objTemp.splice(j,1);
	    			isFind = true;
	    			break;
	    		}
	    		++j;
	    	}

	    	object.position.z = isFind ? z : 4000;

	    }else{
	    	object.position.z = z;
	    }
	    object.position.x = (index%tileSize.width * 80) - 5590;
	    object.position.y = -(Math.floor(index/tileSize.width)%tileSize.height * 60) + 2600;

	    targets.table.push(object);

	  }
	}

	function createModelPositon(){
		// -------------------------------设置动画模式的最终显示位置------------------------ 

		setTablePosition();
	  
		for (var i = 0,l = objects.length; i < l; i++){
			// sphere
			var phi = Math.acos(-1 + (2 * i) / l);
	    var theta = Math.sqrt(l * Math.PI) * phi;
	    var sphereVector =  new THREE.Vector3();

	    var sphrerObject = new THREE.Object3D();

	    sphrerObject.position.x = 800 * Math.cos(theta) * Math.sin(phi);
	    sphrerObject.position.y = 800 * Math.sin(theta) * Math.sin(phi);
	    sphrerObject.position.z = 800 * Math.cos(phi);

	    sphereVector.copy(sphrerObject.position).multiplyScalar(2);

	    sphrerObject.lookAt(sphereVector);

	    targets.sphere.push(sphrerObject);


	 		
	 		// helix
			var vector = new THREE.Vector3();
			var phi = i * 0.275 + Math.PI;

	    var helixObject = new THREE.Object3D();

	    helixObject.position.x = 900 * Math.sin(phi);
	    helixObject.position.y = -(i * 8) + 450;
	    helixObject.position.z = 900 * Math.cos(phi);

	    vector.x = helixObject.position.x * 2;
	    vector.y = helixObject.position.y;
	    vector.z = helixObject.position.z * 2;

	    helixObject.lookAt(vector);

	    targets.helix.push(helixObject);



			// grid
			var gridObject = new THREE.Object3D();

	    gridObject.position.x = ((i % 8) * 500) - 2000;
	    gridObject.position.y = (-(Math.floor(i / 8) % 8) * 200) + 600;
	    gridObject.position.z = (Math.floor(i / 64)) * 1000 - 2000;

	    targets.grid.push(gridObject);


			// waves
			var wavesObject = new THREE.Object3D();

			wavesObject.position.x = (i%(tileSize.width*2) * 100) - 1990;
	    wavesObject.position.z = -(Math.floor(i/(tileSize.width*2))%(tileSize.height*3) * 70) + 1000;

	    wavesObject.rotation.x = 1.5;

	    targets.waves.push(wavesObject);



	    // 定义结束位置
	    var originObject = new THREE.Object3D();

	    originObject.rotation.x = Math.random() * 0.1 - 0.2;
			originObject.rotation.y = Math.random() * 0.1 - 0.2;
			originObject.rotation.z = Math.random() * 0.1 - 0.2;

			originObject.position.x = Math.random() * 4000 - 2000;
			originObject.position.y = Math.random() * 4000 - 2000;
			originObject.position.z = Math.random() * 2000 + 4000;

	    targets.orgin.push(originObject);


	    var compoundObject = new THREE.Object3D();

	    compoundObject.position.x = Math.random() * 8000 - 4000;
			compoundObject.position.y = Math.random() * 1000 + 2000;
			compoundObject.position.z = Math.random() * 2000 - 6000;

			targets.compound.push(compoundObject);
		}

	  // --------------------------------------------------------------------------
	}



	function cemarePosition(target,duration){

		var dtd = $.Deferred();

		if (target.position) {
			new TWEEN.Tween(camera.position)
				.to({
					x:target.position.x,
					y:target.position.y,
					z:target.position.z
				}, Math.random() * duration + duration)
				.easing(TWEEN.Easing.Linear.None)
	    .start();
	  }

	  if (target.rotation) {

	  	 new TWEEN.Tween(camera.rotation)
	      .to({
	        x: target.rotation.x,
	        y: target.rotation.y,
	        z: target.rotation.z
	      }, Math.random() * duration + duration)
	      .easing(TWEEN.Easing.Linear.None)
	      .start();
	  }
	 

	 	new TWEEN.Tween(this)
	    .to({}, duration * 2)
	    .onUpdate(render)
	    .onComplete(function(){
	    	dtd.resolve();
	    })
	    .start();


	  return dtd.promise();
	}


	function transform(targets, duration){

		var dtd = $.Deferred();

	  // TWEEN.removeAll();

	  for (var i = 0; i < objects.length; i++) {

	    var object = objects[i];
	    var target = targets[i];

	    new TWEEN.Tween(object.position)
	      .to({
	        x: target.position.x,
	        y: target.position.y,
	        z: target.position.z
	      }, Math.random() * duration + duration)
	      .easing(TWEEN.Easing.Exponential.InOut)
	      .start();

	    new TWEEN.Tween(object.rotation)
	      .to({
	        x: target.rotation.x,
	        y: target.rotation.y,
	        z: target.rotation.z
	      }, Math.random() * duration + duration)
	      .easing(TWEEN.Easing.Exponential.InOut)
	      .start();

	  }

	  console.log(targets,objects);

	  new TWEEN.Tween(this)
	    .to({}, duration * 2)
	    .onUpdate(render)
	    .onComplete(function(){
	    	dtd.resolve();
	    })
	    .start();

	    return dtd.promise();

	}

	function cemareTransform(target,duration){
		return $.when(cemarePosition(target,duration));
	}

	function transformPromise(targets,duration){
		return $.when(transform(targets, duration));
	}


	var Transform = {
		'grid':function(){
			return transformPromise(targets.grid,5000)
				.then(function(){
					return cemareTransform({position:{x:30,y:10,z:500},rotation:{x:-0.20,y:-2,z:0}},1000)
				})
				.then(function(){
					return cemareTransform({position:{x:0,y:2,z:-200},rotation:{x:0,y:-3,z:0}},1000)
				})
				.then(function(){
					return cemareTransform({position:{x:120,y:20,z:7500},rotation:{x:0,y:0,z:0}},1500)
				})
				.then(function(){
					return cemareTransform({position:{x:140,y:20,z:-1500},rotation:{x:0,y:0,z:0}},2000)
				})
				.then(function(){
					return cemareTransform({position:{x:300,y:-20,z:2500},rotation:{x:0,y:0,z:0}},1000)
				})
				// 如果不加这个第一个图片对象会改变不了位置，这个是进程进入下一个执行队列中
				// 第一个图片位置在添加了removeAll时会进入下一个执行队列，所以两者必须要同时存在
				// .then(function(){
				// 	return cemeraMoveAnimation();
				// })
		},
		'helix':function(){
			return transformPromise(targets.helix,3000)
				.then(function(){
					return cemareTransform({position:{x:30,y:10,z:500},rotation:{x:-0.20,y:-2,z:0}},1000)
				})
				.then(function(){
					return cemareTransform({position:{x:0,y:2,z:-200},rotation:{x:0,y:3,z:0}},2000)
				})
				.then(function(){
					return cemareTransform({position:{x:0,y:2,z:0},rotation:{x:1.5,y:3,z:0}},2000)
				})
				.then(function(){
					return cemareTransform({position:{x:10,y:-11000,z:0},rotation:{x:2,y:3,z:3}},4000)
				})
				.then(function(){
					return cemareTransform({position:{x:10,y:500,z:0},rotation:{x:2,y:-3,z:3}},4000)
				})
				.then(function(){
					return cemareTransform({position:{x:10,y:2500,z:0},rotation:{x:1.5,y:-3.2,z:3}},1000)
				})
				// .then(function(){
				// 	return cemeraMoveAnimation();
				// })
		},
		'sphere':function(){
			isCameraRotated = true;
			return transformPromise(targets.sphere,5000)
				.then(function(){
					return cemeraMoveAnimation(8000);
				})
		},
		'table':function(){
			return cemareTransform({position:{x:0,y:0,z:2500},rotation:{x:0,y:0,z:0}},500)
				.then(function(){
					return transformPromise(targets.table,1000)
				})
				// .then(function(){
				// 	return cemeraMoveAnimation();
				// })
		},
		'waves':function(){
			isCameraRotated = true;
			

			return transformPromise(targets.waves,3000)
				.then(function(){
					isWavesMove = true;
					return cemeraMoveAnimation(21000);
				})
				.then(function(){
					isWavesMove = false;
					return cemeraMoveAnimation();
				})
		},
		'orgin':function(){
			camera.lookAt( new THREE.Vector3() );
			return transformPromise(targets.orgin,2000)
				// .	then(function(){
				// 	return cemeraMoveAnimation();
				// });
		},
		'compoundIn':function(){
			return cemareTransform({position:{x:0,y:0,z:2500},rotation:{x:0,y:0,z:0}},1000)
			.then(function(){
				isCompoundIn = true;
				return transformPromise(targets.compound,2000)
			})
		}
	}

	// 在规定的时间内移动，返回promise对象
	function cemeraMoveAnimation(duration){
		var dtd = $.Deferred();
		setTimeout(function(){
			isCameraRotated = false;
			dtd.resolve();
		},duration);

		return $.when(dtd.promise());
	}

	function updateWaves(){


		for(var i = 0; i < objects.length; i++){
			var time = new Date().getTime() * 5;
			var object = objects[i];

			object.position.y = Math.sin( time * .001 + ( i / ( tileSize.width * .5 ) ) ) * 35;
			object.position.y += Math.cos( time * .0005 + ( i / tileSize.height ) * 50 ) * 55;
		}
	}



	// function cemera

	function cemeraRotate(){
		var time = Date.now() * 0.00015;
		camera.position.x = Math.cos(time) * 1400;
		camera.position.z = Math.sin(time) * 2500;
		camera.position.y = Math.sin(time / 1.4) * 1400;
		camera.lookAt( new THREE.Vector3() );
		camera.updateMatrixWorld();
	}
	
	function pointsFly(){
		camera.lookAt( objects[0] );
		for(var i = 0; i < objects.length; i++){
			var time = new Date().getTime() * 5;
			var object = objects[i];

			// object.position.y -= Math.sin( time * .002 + ( i / ( tileSize.width * .5 ) ) ) * 205;
			// object.position.x += Math.cos( time * .002 + ( i / tileSize.height ) * 50 ) * 105;

			object.position.y -= Math.random() * 100 + 50;
			object.position.x += Math.random() * 350 + 50;

			if (object.position.x >= 4500) {
				object.position.x = -4500;
			}
			// if (object.position.y >= 3000) {
			// 	object.position.u = 2000;
			// }

			object.rotation.x += Math.random() * 0.1;
			object.rotation.y += Math.random() * 0.05;
		}

	}


	function animate(){

		requestAnimationFrame(animate);

		TWEEN.update();

		render();
	}

	function render(){

		if (isCameraRotated) {
			cemeraRotate();
		}
		
		if (isWavesMove) 
			updateWaves();

		if (isCompoundIn) {
			pointsFly();
		}

		renderer.render(scene,camera);
	}


	createPoint(data);

	animate();

	function onWindowResize() {

	  camera.aspect = w / h;
	  camera.updateProjectionMatrix();

	  renderer.setSize(window.innerWidth, window.innerHeight);

	  render();

	}

	function randomArr(arr){
		var index = Math.floor(Math.random() * arr.length);
		var value = arr[index];
		arr.splice(index,1);
		return value;
	}



	// 外部调用接口

	api.photoModeStart = function(){
		var arr = [0,1,2,3];

		return Transform[targets.name[randomArr(arr)]]()
		.then(function(){
			return Transform[targets.name[randomArr(arr)]]()
		})
		.then(function(){
			return Transform[targets.name[randomArr(arr)]]()
		})
		.then(function(){
			return Transform[targets.name[arr[0]]]()
		});
		
	}

	api.autoModeStart = function(){
		var arr = [0,1,2,3];

		return Transform[targets.name[randomArr(arr)]]();
	}

	api.loaded = function(){
		var dtd = $.Deferred();

		var timer = setInterval(function(){
			if (data.length <= completeImages.length ? true : false) {
				dtd.resolve();
				clearInterval(timer);
			}
		},500);

		return $.when(dtd.promise());
	}

	// TODO：将改成加载拼接好的大图片
	api.loadImage = function(img){
		
		addImage(img,function(texture){

		});
	}

	api.showCompoundImg = function(duration,texture){

		if (texture) {
			compound.mesh.material.map = texture;
		}else{
			compound.mesh.material.map = compound.texture[compound.indexNow++];

			compound.indexNow = compound.indexNow >= compound.texture.length ? 0 : compound.indexNow;
		}
		
		compound.mesh.material.opacity = 1;

		Transform.compoundIn();

		var dtd = $.Deferred();
				setTimeout(function(){
					isCompoundIn = false;
					dtd.resolve();
				},duration);

				return $.when(dtd.promise());
	}

	//拼出图片的方法
	api.setTable = function(duration,obj){
		setTablePosition(obj);
		return Transform.table()
			.then(function(){
				var dtd = $.Deferred();
				setTimeout(function(){
					dtd.resolve();
				},duration);

				return $.when(dtd.promise());
			});
		
	}

	api.end = function(){
		compound.mesh.material.opacity = 0;
		return Transform.orgin();
	}



	return api;
}
