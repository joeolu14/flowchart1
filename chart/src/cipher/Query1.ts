const Query1 =
  "MATCH p1=(:Vendor)-[:OUTPUTS|INPUT_TO|FULFILLS*]->(:Customer) unwind nodes(p1) as n1 OPTIONAL MATCH p2=(n1)<-[]-(:ZProcess) OPTIONAL MATCH p3=(n1)-[:HOLDS]->(:Batch) RETURN p1 as p1,p2 as p2,p3 as p3, relationships(p1) as r1, relationships(p2) as r2, relationships(p3) as r3 LIMIT 30";

export default Query1;
