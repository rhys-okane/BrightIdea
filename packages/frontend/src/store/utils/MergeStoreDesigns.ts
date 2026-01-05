import type { APIGetDesignsResponse } from "@shared/models/api/APIGetDesignsRequest";
import { type MyStoreDesign, type SomeoneElsesStoreDesign } from "@src/store/types/design/StoreDesign";

interface Returns {
  myDesigns: MyStoreDesign[];
  othersDesigns: SomeoneElsesStoreDesign[];
}

export function extractOthersDesignsFromAPI(
  myDesigns: MyStoreDesign[],
  apiDesigns: APIGetDesignsResponse["designs"]
): Returns {
  const myDesignsMap: Map<string, MyStoreDesign> = new Map(myDesigns.map((design) => [design.id, design]));

  const othersDesigns = apiDesigns
    .filter((apiDesign) => !myDesignsMap.has(apiDesign.id))
    .map<SomeoneElsesStoreDesign>((apiDesign) => ({
      ...apiDesign,
      isMine: false,
    }));

  const newMyDesigns = apiDesigns
    .filter((apiDesign) => myDesignsMap.has(apiDesign.id))
    .map<MyStoreDesign>((apiDesign) => ({
      ...apiDesign,
      isNew: false,
      isMine: true,
      editToken: myDesignsMap.get(apiDesign.id)!.editToken,
    }));

  return { myDesigns: newMyDesigns, othersDesigns };
}
