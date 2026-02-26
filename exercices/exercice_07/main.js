import Point from "./Point.js";
import Polygon from "./Polygon.js";
import { ProxyLogger } from "./ProxyLogger.js";

const point = new Point(5, 4);
const pointLog = new ProxyLogger(point);

const polygon = new Polygon([new Point(0,0), new Point(0,1), new Point(1,0)]);
const polygonLog = new ProxyLogger(polygon);

// Toutes les lignes suivantes devraient provoquer des affichage dans la console.

console.log("Logging du Point")

const px = pointLog.x;      // Doit afficher "Get attribute : x"
pointLog.x = 10;            // Doit afficher "Set attribute : x with value 10"     
const py = pointLog.y;      // Doit afficher "Get attribute : y"
pointLog.y = 10;            // Doit afficher "Set attribute : y with value 10"
pointLog.translate(-5, -5); // Doit afficher "Calling method: translate"
                            //               "Get attribute : x"
                            //               "Set attribute : x with value 5"
                            //               "Get attribute : y"
                            //               "Set attribute : y with value 5"

console.log("Logging du Polygon :")

const firstPolygonPoint = polygonLog.points[0]; // Doit afficher "Get attribute : points"
const area = polygonLog.getArea();              // Doit afficher "Calling method: getArea"
                                                //               "Get attribute : points"
const perimeter = polygonLog.getPerimeter();    // Doit afficher "Calling method: getPerimeter"
                                                //               "Get attribute : points"
polygonLog.translate(5, 10);                    // Doit afficher "Calling method: translate"
                                                //               "Get attribute : points"

