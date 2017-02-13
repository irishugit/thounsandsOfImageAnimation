/*
* @Author: Iris Hu
* @Date:   2016-11-29 15:16:10
* @Last Modified by:   Iris Hu
* @Last Modified time: 2017-02-07 16:26:27
*/

function init(){

	
	var canvas = document.getElementById('myCanvas');

	// 已分析完的大图路径
	var compoundData = [
	{tilePath:'./images/china1.jpg'},
	{tilePath:'./images/china2.jpg'},
	{tilePath:'./images/china1-1.jpg'},
	{tilePath:'./images/china2-1.jpg'},
	{tilePath:'./images/world_ccm.jpg'},
	{tilePath:'./images/world_er.jpg'},
	{tilePath:'./images/world_plant.jpg'},
	{tilePath:'./images/china1.jpg'},
	{tilePath:'./images/china2.jpg'},
	{tilePath:'./images/world_ccm.jpg'},
	{tilePath:'./images/world_er.jpg'},
	];



	// TODO:data要改成从后端传来或者是读取的本地的json文件
	// images.addImages(data);

	var images = ImageWall({
		canvas:canvas,
		cameraPositionZ:2500,
		lightColor:0x656565,
		tileImg:{
			width:80,
			height:60,
			range:[230,130,500]
		},
		compoundImg:{
			width:4200,
			height:2100,
			data:compoundData
		},
		parameters:data

	});

	images.loaded().then(imagesAni);
	
	function imagesAni(){
		return images.autoModeStart()
			.then(function(){
				return images.setTable(15000)
				// return images.showCompoundImg(15000)
			})
			.then(function(){
				return images.end()
			})
			.then(function(){
				return imagesAni();
			})
	}
}


