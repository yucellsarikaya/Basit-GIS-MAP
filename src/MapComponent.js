import React, { useRef, useEffect, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { WKT } from "ol/format";

const MapComponent = () => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const drawInteractionRef = useRef(null);
  const [featuresWKT, setFeaturesWKT] = useState([]);

  useEffect(() => {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: {
        "fill-color": "rgba(255, 255, 255, 0.2)",
        "stroke-color": "#ffcc33",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#ffcc33",
      },
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, []);

  const addDrawInteraction = (event) => {
    const type = event.target.value;
    if (!type || !map) return;

    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
    }
    if (type !== "none") {
      const drawInteraction = new Draw({
        source: map.getLayers().getArray()[1].getSource(),
        type: type,
      });

      drawInteraction.on("drawend", (evt) => {
        const feature = evt.feature;
        const wktFormat = new WKT();
        const featureWKT = wktFormat.writeFeature(feature);
        setFeaturesWKT((oldWKTs) => [...oldWKTs, featureWKT]);
      });

      map.addInteraction(drawInteraction);
      drawInteractionRef.current = drawInteraction;
    }
  };
  const renderWKTList = () => {
    return featuresWKT.map((wkt, index) => (
      <li key={index} style={styles.listItem}>
        {wkt}
      </li>
    ));
  };
  return (
    <div>
      <select onChange={addDrawInteraction} defaultValue="none">
        <option value="none">Select Drawing Type</option>
        <option value="Point">Point</option>
        <option value="LineString">LineString</option>
        <option value="Polygon">Polygon</option>
      </select>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }}></div>
      <ul style={styles.list}>{renderWKTList()}</ul>
    </div>
  );
};
const styles = {
  container: {
    textAlign: "center",
    margin: "10px",
  },
  map: {
    width: "100%",
    height: "400px",
    margin: "auto",
  },
  list: {
    listStyleType: "none",
    padding: "0",
    textAlign: "left",
  },
  listItem: {
    backgroundColor: "#f7f7f7",
    margin: "5px 0",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  dropdown: {
    margin: "10px 0",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
};

export default MapComponent;
