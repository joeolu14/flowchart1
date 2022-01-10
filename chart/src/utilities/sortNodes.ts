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

export const sortNodes = (
  nodeObject: ObjTypes[],
  i: number,
  setState: React.Dispatch<React.SetStateAction<LinkTypes[]>>,
  setRelationshipState: React.Dispatch<React.SetStateAction<any[]>>,
  links: LinkTypes[]
) => {
  let arr_links: LinkTypes[] = [...links];
  let rel_links: any = [];
  nodeObject?.forEach((res: any) => {
    let objLink: any = {};
    let rel: any = {};
    if (
      !arr_links.find(
        (resp) => resp?.identity === res?.relationship?.identity?.low
      )
    ) {
      objLink["source"] = res?.start?.identity?.low;
      objLink["sourcelabel"] = res?.start?.labels[0];
      objLink["target"] = res?.end?.identity?.low;
      objLink["targetlabel"] = res?.end?.labels[0];
      objLink["type"] = res?.relationship?.type;
      objLink["identity"] = res?.relationship?.identity?.low;
    }

    if (objLink?.source) arr_links.push(objLink);

    if (
      !rel_links.find(
        (resp: any) => resp?.identity === res?.relationship?.identity?.low
      )
    ) {
      rel["source"] = res?.relationship?.start?.low;
      rel["target"] = res?.relationship?.end?.low;
      rel["identity"] = res?.relationship?.identity?.low;
      rel["type"] = res?.relationship?.type;
      rel["sourcelabel"] =
        res?.relationship?.start?.low === res?.start?.identity?.low
          ? res?.start?.labels[0]
          : res?.end?.labels[0];
      rel["targetlabel"] =
        res?.relationship?.end?.low === res?.end?.identity?.low
          ? res?.end?.labels[0]
          : res?.start?.labels[0];
    }
    if (rel?.source) rel_links.push(rel);
  });
  setState(arr_links);
  setRelationshipState(rel_links);
};
