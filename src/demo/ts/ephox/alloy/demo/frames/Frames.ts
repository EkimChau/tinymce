import { SugarElement, SugarDocument } from "ephox/alloy/alien/TypeDefinitions";
import { Option } from "@ephox/katamari";
import { Body, Element, Traverse} from '@ephox/sugar';

const iframeDoc = (element: SugarElement): Option<SugarDocument> => {
  const dom = element.dom() as HTMLFrameElement;
  try {
    const idoc = dom.contentWindow ? dom.contentWindow.document : dom.contentDocument;
    return idoc !== undefined && idoc !== null ? Option.some(Element.fromDom(idoc)) : Option.none();
  } catch (err) {
    // ASSUMPTION: Permission errors result in an unusable iframe.
    console.log('Error reading iframe: ', dom);
    console.log('Error was: ' + err);
    return Option.none();
  }
};

// NOTE: This looks like it is only used in the demo. Move out.
const readDoc = (element: SugarElement): SugarDocument => {
  const optDoc = iframeDoc(element);
  return optDoc.getOrThunk(() => {
    // INVESTIGATE: This is new, but there is nothing else than can be done here atm. Rethink.
    return Traverse.owner(element) as SugarDocument;
  });
};

const write = (element: SugarElement, content: string): void => {
  if (!Body.inBody(element)) { throw new Error('Internal error: attempted to write to an iframe that is not n the DOM'); }

  const doc = readDoc(element);
  const dom = doc.dom() as HTMLDocument;
  dom.open();
  dom.writeln(content);
  dom.close();
};

export {
  write,
  readDoc
};
