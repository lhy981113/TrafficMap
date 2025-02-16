import React, { useState, useEffect } from 'react';
import {useNavigate, useLocation} from 'react-router';
import axios from 'axios';
import '../css/Main.css';
import SearchBar from "../components/SearchBar";
import Button from "../components/Button";
import getLocation from '../getLocation';
import plus from "../images/plus.png";
import minus from "../images/minus.png"
import target from "../images/location.png"
import BuildingDetailInfo from "../components/BuildingDetailInfo"
import BusStopDetailInfo from '../components/BusStopDetailInfo';

import placeholderred from "../images/placeholderred.png"
import mylocation from "../images/mylocation.png"


function LocationMap() {
    const [sid, setSid] = useState();
    const [keyword, setKeyword] = useState();  //검색 받은 키워드
    const [plusbutton, setPlusButton] = useState();
    const [minusbutton, setMinusButton] = useState();
    const [locationbutton, setLocationButton] = useState();
    const [infoWindow, setInfoWindow] = useState(true);

    const building = useLocation();
    const navigate = useNavigate();
 
    const [location, setLocation] = useState();
    const [buildinglocation, setBuildingLocation] = useState();
    const [subway, SetSubway] = useState();
    const [error, setError] = useState();

    useEffect(()=>{
      if(building.state.subway){
        SetSubway(building.state.subway);
        setSid(1);
      }
    })

    const handlePlusButton = () => {
      setPlusButton(true);
    };
    const handleMinusButton = () => {
      setMinusButton(true);
    };
    const handleLocationButton = () => {
      setLocationButton(true);
    }

    const handleSuccess = (pos) => {
      var buildinglatitude;
      var buildinglongitude
      if(building.state.props.address !== '버스정류장'){
        buildinglatitude = building.state.props.obj.latitude;
        buildinglongitude = building.state.props.obj.longitude;
        if(building.state.subway === null){
          setSid(0);
        }
      }
      else{
        setSid(2);
        buildinglatitude = building.state.props.obj.posx;
        buildinglongitude = building.state.props.obj.posy;
      }
    
      const {latitude, longitude } = pos.coords;
      setLocation({
        latitude, longitude
      })
      setBuildingLocation({
        buildinglatitude, buildinglongitude
      })
    };

    // const handleError= (error) -> {
    //   setError(error.message);
    // };

    const handlebackButton = () => {
      window.location.href = "/";
    }

  
    const handleKeyword = (e) => setKeyword(e.target.value);
    
    function setScreenSize(){
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
     
  useEffect(() => {
    var zoomin;
    var zoomout;
    var movelocation;

    setScreenSize();
    if(building){
      navigator.geolocation.watchPosition(handleSuccess);
    }
    if(location){
      var lat = location.latitude;
      var lng = location.longitude;
    }
    if(buildinglocation){
      var blat = buildinglocation.buildinglatitude;
      var blng = buildinglocation.buildinglongitude;
    }

    if(plusbutton === true){
      zoomin = true;
      setPlusButton(false);
    }
    else{
      zoomin = false;
    }
    if(minusbutton === true){
      zoomout = true;
      setMinusButton(false);
    }
    else{
      zoomout = false;
    }
    if(locationbutton === true){
      movelocation = true;
      setLocationButton(false);
    }
    else{
      movelocation = false;
    }

    const script = document.createElement("script");
    script.innerHTML = ` 
        var locationmap;
        var zoomIn;
        function initTmap(pos) {
          var wgs84;
          if(parseInt(pos.lat) > 1000){
            var epsg3857 = new Tmapv2.Point(pos.lat, pos.lng);
            console.log(epsg3857);
            wgs84 = Tmapv2.Projection.convertBesselTMToWGS84GEO(epsg3857);
            console.log("좌표변환실행");
            console.log(wgs84);
          }
          else{
            wgs84 = new Tmapv2.LatLng(pos.lat, pos.lng);
          }
            var map = new Tmapv2.Map("TMapApp", {
                center: wgs84,
                width: "100%",
                height: "100%",
                httpsMode: true,
                zoomControl: false,
                zoom:18
            });
            map.addListener("click", onClick); //웹에서 지도 클릭
            map.addListener("touchstart", onTouchstart); // 모바일에서 지도 터치
    
            //map.zoomIn();
            //map["zoomIn"]();
        
            return map;
        }

        function createmarker(lat, lng, img){
          var wgs84;
          if(parseInt(lat) > 1000){
            var epsg3857 = new Tmapv2.Point(lat, lng);
            console.log(epsg3857);
            wgs84 = Tmapv2.Projection.convertBesselTMToWGS84GEO(epsg3857);
            console.log("좌표변환실행");
            console.log(wgs84);
          }
          else{
            wgs84 = new Tmapv2.LatLng(lat, lng);
          }
          var marker = new Tmapv2.Marker({
            position: wgs84,
            icon: img,
            map: locationmap
          })
        }

        function onClick(e) {
            var result_mouse = e.latLng
            var resultDiv = document.getElementById("result_mouse");
            resultDiv.innerHTML = result_mouse;
            console.log(result_mouse._lat);     
        }

        function onTouchstart(e) {
            var result = e.latLng
            var resultDiv = document.getElementById("result");
            resultDiv.innerHTML = result;
        }
        
        if(!locationmap && ${lat} && ${blat}){
          var mylocation = {lat: ${blat}, lng: ${blng}};
          locationmap = initTmap(mylocation);
          createmarker(${lat}, ${lng}, "${mylocation}");
          createmarker(${blat}, ${blng}, "${placeholderred}");  
        }
        else{
          console.log("Init false");
        }

        if(locationmap && ${zoomin}){
          locationmap.zoomIn();
        }
        if(locationmap && ${zoomout}){
          locationmap.zoomOut();
        }
        if(locationmap && ${movelocation}){
          var setmylocation = new Tmapv2.LatLng(${lat}, ${lng});
          locationmap.setCenter(setmylocation);
        }
   `;
    script.type = "text/javascript";
    script.async = "async";
    document.head.appendChild(script);
  }, [handleSuccess]);

  return (
    <main style={{overflow: "hidden"}}>
    <div
      id="TMapApp"
      style={{
        height: "100%",
        width: "100%",
        position: "fixed",
        overflow: "hidden",
      }}
    >
    </div>

    <nav
      class="navbar navbar-default"
      style={{
        width: "100%",
        height: "10%",
        display: "flex",
        padding: "0px 10px",
        backgroundColor: "white",
        boxShadow: "0px 1px 20px 1px #A6A6A6",
      }}>
      <div className="row" style={{ textAlign: "center", width: "100%"}}>
        <div className="col-2" style={{ }}>
        <i
          class="bi bi-arrow-left-circle"
          style={{ fontSize: "2rem"}}
          onClick={handlebackButton}
        ></i>
        </div>
        <div className="col-10 align-self-center" style={{ right: "5%" }}>
        {building.state.props.name}
        </div>
      </div>

    </nav>


    <div className="left">
      <div className="mylocation">
        <Button onClick={handleLocationButton} src={target}/>
      </div>

    </div>

    <div className="rightbarbutton">
      <div className="zoom">
        <Button onClick={handlePlusButton} src={plus}/>
        <Button onClick={handleMinusButton} src={minus}/>
        {/* <SideBar /> */}
      </div>
    </div>
    {sid !== 2 && 
    <div className="Infobar" style={{position: "fixed", width: "100%", height: "10%", bottom: "0px" }}>
        <BuildingDetailInfo props={building.state.props.obj} subway={subway}/>
    </div>}
    {sid === 2 && <BusStopDetailInfo obj={building.state.props.obj} bustop={building.state.busstop} location={location}></BusStopDetailInfo>}

    </main>
  );
}

export default LocationMap;