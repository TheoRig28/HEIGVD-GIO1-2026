import './style.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import Draw from 'ol/interaction/Draw.js';
import {getArea, getLength} from 'ol/sphere.js';

import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';
import VectorSource from 'ol/source/Vector.js';

import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';

import Fill from 'ol/style/Fill.js';
import RegularShape from 'ol/style/RegularShape.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import Text from 'ol/style/Text.js';
import CircleStyle from 'ol/style/Circle.js';

import LineString from 'ol/geom/LineString.js';
import Point from 'ol/geom/Point.js';

const opacityInput = document.getElementById('opacity-input');

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

const labelStyle = new Style({
  text: new Text({
    font: '14px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [3, 3, 3, 3],
    textBaseline: 'bottom',
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
  }),
});

function formatLength(line) {
  return Math.round(getLength(line) * 100) / 100 + ' ' + 'm';
}

function formatArea(polygon) {
  return Math.round(getArea(polygon) * 100) / 100 + ' ' + 'm\xB2';
};

function styleFunction(feature) {
  const segmentStyles = [labelStyle.clone()];
  const styles = [style];
  const geometry = feature.getGeometry();
  if(geometry.getType() == 'Polygon'){
    let count = 0;
    const line = new LineString(geometry.getCoordinates()[0]);
    line.forEachSegment((a, b) => {
      const segment = new LineString([a, b]);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(labelStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(formatLength(segment));
      styles.push(segmentStyles[count]);
      count++;
    });

    labelStyle.setGeometry(geometry.getInteriorPoint());
    labelStyle.getText().setText(formatArea(geometry));
    styles.push(labelStyle);
  }
  return styles;
}

function createMap(wmts_url){
  const WMTS_result = new WMTSCapabilities().read(wmts_url);
  const road_tilelayer = new TileLayer({
    opacity: 1,
    source: new WMTS(optionsFromCapabilities(WMTS_result, {
      layer: 'ch.swisstopo.swisstlm3d-strassen',
      matrixSet: 'EPSG:3857',
    })),
  })

  const vectorSource = new VectorSource({wrapX: false});
  const vectorLayer = new VectorLayer({source: vectorSource, style: feature => styleFunction(feature)});

  const map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        opacity: 1,
        source: new WMTS(optionsFromCapabilities(WMTS_result, {
          layer: 'ch.swisstopo.swisssurface3d-reliefschattierung-multidirektional',
          matrixSet: 'EPSG:3857',
        })),
      }),
      road_tilelayer,
      vectorLayer
    ],
    view: new View({
      center: [854900, 5894900],
      zoom: 8,
    }),
  });

  map.addInteraction(new Draw({
    source: vectorSource,
    type: 'Polygon',
    style: feature => styleFunction(feature),
  }));

  function update(){
    road_tilelayer.setOpacity( parseFloat(opacityInput.value))
  }
  opacityInput.addEventListener('input', update);
  update()
}

fetch('https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml?lang=fr').then(response => response.text()).then(text => createMap(text));

