import React, { useCallback, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import Q1 from "../../cipher/Query1";
import { useReadCypher } from "use-neo4j";
import { fixNode } from "../../utilities/fixNode";
import { sortNodes } from "../../utilities/sortNodes";
import { SimulationNodeDatum } from "d3";

interface ObjTypes extends SimulationNodeDatum {
  id: number;
}
interface LinkTypes {
  identity: number;
  source: number;
  sourcelabel: string;
  target: number;
  targetlabel: string;
  type: string;
}

const QueryReader = () => {
  const HEIGHT = 700;
  const [nodes, setNodes] = useState<ObjTypes[]>([]);
  const [links, setLinks] = useState<LinkTypes[]>([]);
  const [selectedD, setSelectedD] = useState<any>();
  const [p1Data, setP1Data] = useState<LinkTypes[]>([]);
  const [p2Data, setP2Data] = useState<LinkTypes[]>([]);
  const [p3Data, setP3Data] = useState<LinkTypes[]>([]);
  const [p1Relationship, setP1Relationship] = useState<any[]>([]);
  const [p2Relationship, setP2Relationship] = useState<any[]>([]);
  const [p3Relationship, setP3Relationship] = useState<any[]>([]);
  const [xValue, setXValue] = useState(0);

  const [width, setwidth] = useState(0);
  const { loading, error, records } = useReadCypher(Q1);

  if (error) {
    console.log(error);
  }

  //to set Nodes
  useEffect(() => {
    if (links.length > 0) {
      let stateArr = [...links];
      let newArr: any[] = [];
      let checkArr: any[] = [];
      stateArr.forEach((res) => {
        if (newArr.includes(res.source)) {
          if (!newArr.includes(res.target)) {
            let obj = {
              node: res.target,
              id: res.targetlabel,
            };
            newArr.push(res.target);
            checkArr.push(obj);
          }
        } else {
          let obj = {
            node: res.source,
            id: res.sourcelabel,
          };
          newArr.push(res.source);
          checkArr.push(obj);
          if (!newArr.includes(res.target)) {
            let obj = {
              node: res.target,
              id: res.targetlabel,
            };
            newArr.push(res.target);
            checkArr.push(obj);
          }
        }
      });
    }
  }, [links]);

  //to set the relationships
  useEffect(() => {
    if (nodes.length === 0) {
      if (!loading) {
        const data1 = records?.map((res) => res?.get("p1"));
        const data2 = records?.map((res) => res?.get("p2"));
        const data3 = records?.map((res) => res?.get("p3"));

        let dd1: any = [];
        let dd2: any = [];
        let dd3: any = [];

        if (data1 !== null) {
          data1?.forEach((res, i) => {
            if (res) {
              let seg = res?.segments;
              dd1.push(...seg);
            }
          });
        }
        if (data2 !== null) {
          data2?.forEach((res, i) => {
            if (res) {
              let seg = res?.segments;
              dd2.push(...seg);
            }
          });
        }
        if (data3 !== null) {
          data3?.forEach((res, i) => {
            if (res) {
              let seg = res?.segments;
              dd3.push(...seg);
            }
          });
        }

        sortNodes(dd1, 1, setP1Data, setP1Relationship, links);
        sortNodes(dd2, 2, setP2Data, setP2Relationship, links);
        sortNodes(dd3, 3, setP3Data, setP3Relationship, links);
      }
    }
  }, [loading, records, links, nodes]);

  const svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", HEIGHT)
    .style("font", "10px sans-serif");

  //draw linking curve
  const lineArrow = svg.append("g").append("path");
  useEffect(() => {
    if (xValue) {
      const path = `m ${
        xValue - 220
      }  270 v 19 l 60 0 v 19 h6 l -6 6 l -6 -6 h6 v -19 h -60`;

      lineArrow.attr("d", path).attr("stroke", "black").attr("fill", "black");
    }

    return () => {
      lineArrow.remove();
    };
  }, [xValue, lineArrow]);

  const NodeNames = p1Data.map((res, i) => {
    if (p1Data.length - 1 === i) {
      return res.targetlabel;
    }
    return res.sourcelabel;
  });
  const color = d3.scaleOrdinal(NodeNames, d3.schemeCategory10);
  useEffect(() => {
    let linesArr: any[] = [];
    const pp = [...p1Data];
    pp.push(pp[pp.length - 1]);
    const MaxWidth = pp.length * 95;
    setwidth(MaxWidth);
    const types = p1Data.map((res) => res.type);

    if (p1Data.length > 0 && width > 0) {
      const group = svg
        .append("g")
        .selectAll("g")
        .data(pp)
        .join("g")
        .classed("group", true);

      group
        .append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "transparent")
        .attr("stroke", (d, i) => {
          if (p1Data.length === i) {
            return color(d.targetlabel);
          }
          return color(d.sourcelabel);
        })
        .attr("x", (d, i) => i * 90)
        .attr("y", 240)
        .each(function (d, i) {
          //@ts-ignore
          let obj = {
            //@ts-ignore
            x1: this.x.baseVal.value + 92,
            //@ts-ignore
            y1: this.y.baseVal.value,
            type: d.type,
          };
          linesArr.push(obj);
        })
        .on("click", (e, d) => {
          setSelectedD(d);
          setXValue(e.layerX + 220);
          // setYValue1(e.clientY);
        });

      group
        .append("text")
        .text((d, i) => {
          if (i === pp.length - 1) {
            return d.targetlabel + "  +";
          } else {
            return d.sourcelabel + "  +";
          }
        })
        .attr("x", (d, i) => i * 90 + 5)
        .attr("y", 252)
        .style("font-size", "10px")
        .classed("text-normal", true)
        .on("click", (e, d) => {
          setXValue(e.layerX + 240);
          setSelectedD(d);
        });

      linesArr.pop();

      //Make our Arrow Marker

      svg
        .append("defs")
        .selectAll("marker")
        .data(types)
        .join("marker")
        .attr("id", (d) => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "black")
        .attr("d", "M0,-5L10,0L0,5");

      //   Draw our connecting lines;

      const lines = svg.append("g");
      lines
        .selectAll("line")
        .data(linesArr)
        .join("line")
        .attr("x1", (d) => d.x1 - 30)
        .attr("x2", (d) => d.x1 - 10)
        .attr("y1", 250)
        .attr("y2", 250)
        .attr("stroke", "black")
        .attr("marker-end", (d) => `url(#arrow-${d.type})`);
    }
  }, [color, svg, p1Data, width]);

  const box = svg
    .append("g")
    .attr("width", 600)
    .attr("height", 300)
    .attr("x", xValue - 200)
    .classed("box-re", true);

  const llb = box.append("g");

  useEffect(() => {
    if (selectedD) {
      let totalArray: any[] = [];
      totalArray = totalArray.concat(
        p1Relationship,
        p2Relationship,
        p3Relationship
      );
      const source = selectedD.source;
      const target = selectedD.target;

      const newArray = totalArray.filter(
        (res) =>
          res.source === source ||
          res.target === source ||
          res.source === target ||
          res.target === target
      );

      const nodess = fixNode(newArray);

      setNodes(nodess);
      setLinks(newArray);
    }
  }, [selectedD, p1Relationship, p2Relationship, p3Relationship]);

  const points: any = useMemo(() => [], []);

  const getLinksCord = useCallback(() => {
    const links1 = [...links];
    if (links1) {
      links1.forEach((res: any, i) => {
        let tb = points.find((resp: any) => resp.id === res.source);

        if (tb) {
          //@ts-ignore
          links1[i]["x1"] = tb?.x;
          //@ts-ignore
          links1[i]["y1"] = tb?.y;
        }

        let th = points.find((resp: any) => resp.id === res.target);
        if (th) {
          //@ts-ignore
          links1[i]["x2"] = th?.x;
          //@ts-ignore
          links[i]["y2"] = th?.y;
        }
      });

      // setLinks(links1);
    }
  }, [points, links]);

  //Descriptive box
  useEffect(() => {
    // Draw our Output Box

    //setNodes
    const color = d3.scaleOrdinal(NodeNames, d3.schemeCategory10);
    if (nodes.length > 0 && links.length > 0) {
      box
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("width", 75)
        .attr("height", 40)
        .attr("fill", "transparent")
        .attr("stroke", (d, i) => {
          if (p1Data.length - 1 === i) {
            //@ts-ignore
            return color(d.targetlabel);
          }
          //@ts-ignore
          return color(d.sourcelabel) || color(d.targetlabel);
        })
        ///@ts-ignore

        .attr("x", function (d, i) {
          if (i === 1) {
            return xValue - 200;
          } else {
            if (i % 2 !== 0) {
              return xValue - 110;
            } else {
              return xValue - 300;
            }
          }
        });
      ///@ts-ignore
      //Animation
      box
        .selectAll("rect")
        .transition()
        .duration(2000)
        .attr("y", function (d, i) {
          if (i === 1) {
            return 314;
          } else {
            return 324 + i * 40 + 60;
          }
        });

      box
        // .attr("x", xValue)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 7)
        .attr("stroke", "black")
        .transition()
        .duration(2000)
        .attr("fill", (d, i) => {
          if (p1Data.length - 1 === i) {
            //@ts-ignore
            return color(d.targetlabel);
          }
          //@ts-ignore
          return color(d.sourcelabel) || color(d.targetlabel);
        })
        ///@ts-ignore
        .attr("cx", function (d, i) {
          if (i === 1) {
            points[i] = { ...points[i], id: d.id, x: xValue - 200 };

            return xValue - 170;
          } else {
            if (i % 2 !== 0) {
              points[i] = { ...points[i], id: d.id, x: xValue - 100 };

              return xValue - 35;
            } else {
              points[i] = { ...points[i], id: d.id, x: xValue - 300 };

              return xValue - 300;
            }
          }
        })
        ///@ts-ignore
        .attr("cy", function (d, i) {
          if (i === 1) {
            points[i] = { ...points[i], id: d.id, y: 334 };

            return 320;
          } else {
            points[i] = { ...points[i], id: d.id, y: 334 + i * 40 + 60 };

            return 334 + i * 40 + 72;
          }
        });

      getLinksCord();
      box
        .selectAll("text")
        .data(nodes)
        .join("text")
        //@ts-ignore
        .text((d, i) => {
          if (i === 1) {
            //@ts-ignore
            return d.sourcelabel || d.targetlabel;
          }
          //@ts-ignore
          return d.targetlabel || d.sourcelabel;
        })
        .style("font-size", "10px")
        .classed("text-normal2", true)
        .transition()
        .duration(2000)
        //@ts-ignore
        .attr("x", function (d, i) {
          //@ts-ignore

          if (i === 1) {
            return xValue - 190;
          } else {
            if (i % 2 !== 0) {
              return xValue - 90;
            } else {
              return xValue - 290;
            }
          }
        })
        ///@ts-ignore
        .attr("y", function (d, i) {
          //@ts-ignore
          if (i === 1) {
            return 350;
          } else {
            return 350 + i * 40 + 60;
          }
        });
    }
    return () => {
      llb.remove();
      box.remove();
    };
  }, [
    xValue,
    nodes,
    selectedD,
    NodeNames,
    box,
    getLinksCord,
    links.length,
    llb,
    p1Data.length,
    points,
  ]);

  //Drawing the lines
  useEffect(() => {
    // getLinksCord();
    const linkArr: any[] = [...links];
    const types_links = linkArr.map((res) => {
      return { type: res.type, label: res.targetlabel };
    });

    svg
      .append("defs")
      .selectAll("marker")
      .data(types_links)
      .join("marker")
      .attr("id", (d) => `arrow-${d.type}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "black")
      .attr("d", "M0,-5L10,0L0,5");

    llb
      .selectAll("line")
      .data(linkArr)
      .join("line")
      //@ts-ignore
      .attr("stroke", (d) => color(d.targetlabel))
      .transition()
      .duration(2000)
      //@ts-ignore
      .attr("x1", (d, i) => d.x1 + 20 + i * 4)
      //@ts-ignore
      .attr("x2", (d, i) => d.x2 + 20 + i * 4)
      //@ts-ignore
      .attr("y1", (d, i) => {
        return d.y1;
      })
      //@ts-ignore
      .attr("y2", (d, i) => {
        //@ts-ignore
        return d.y2;
      })
      .attr("marker-end", (d) => `url(#arrow-${d.type})`);

    return () => {
      llb.remove();
    };
  }, [links, color, llb, svg]);

  //draw the connecting lines

  return (
    <div
      style={{
        overflow: "auto",
        width: "1000px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <svg> </svg>
    </div>
  );
};

export default QueryReader;
