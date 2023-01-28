import {
  $E,
  cleanupChildNodes,
  createElement,
  removeAllChildren,
  TCreateElementArgExtended,
} from "mts-dom";
import { LinkedList } from "mts-base/collections";
import { IUIPiece, IUIPParent } from "./core.js";

export class UIPBase implements IUIPiece {
  protected _root: Element;
  constructor(
    arg: TCreateElementArgExtended,
    children?: TCreateElementArgExtended[]
  ) {

    this._root = createElement(arg, children== undefined ? [] :children);
  }

  get root() {
    return this._root;
  }

  get length() {
    return 0;
  }

  children(): Iterable<IUIPiece> {
    return {
      *[Symbol.iterator]() {},
    };
  }
}

export class UIPParentBase extends UIPBase implements IUIPParent {
  protected _children = new LinkedList<IUIPiece>();

  get length(): number {
    return this._children.length;
  }

  get firstChild() {
    return this._children.first;
  }

  get lastChild() {
    return this._children.last;
  }

  get lenght(): number {
    return this._children.length;
  }

  appendChild(child: IUIPiece) {
    this._children.append(child);
    return this;
  }

  removeChild(child: IUIPiece): boolean {
    return this._children.remove(child) > 0;
  }

  replaceChild(newChild: IUIPiece, oldChild: IUIPiece): IUIPiece {
    let r = this._children.replace(oldChild, newChild);
    if (!r) {
      // throw `ParentUI.replaceChild: oldChild not found`;
    }
    return this;
  }

  insertChild(newChild: IUIPiece, referenceChild: IUIPiece, after?: boolean | undefined) {
    const r = after
      ? this._children.insert(newChild, { after: referenceChild })
      : this._children.insert(newChild, { before: referenceChild });
    if (!r) {
      throw `ParentUI.insertChild: referenceChild not found`;
    }
    return this;
  }

  clearChildren(): IUIPiece {
    this._children.clear();
    return this;
  }

  children(): Iterable<IUIPiece> {
    const that = this;
    return {
      *[Symbol.iterator]() {
        for (const child of that._children) {
          yield child;
        }
      },
    };
  }
}

export class UIPParent extends UIPParentBase implements IUIPParent {
  readonly parent: Element;

  constructor(arg: TCreateElementArgExtended, parent?: string | Element) {
    const root = $E(arg);

    super(root);
    if (parent instanceof Element) {
      this.parent = parent;
    } else if (parent != undefined) {
      const p = this.root.querySelector(parent);
      if (p) {
        this.parent = p;
      } else {
        throw new Error(`No parent found for selector: ${parent}`);
      }
    } else {
      this.parent = this.root;
    }

    cleanupChildNodes(this.parent);
    for (let i = 0; i < this.parent.children.length; i++) {
      let child = this.parent.childNodes[i];
      super.appendChild(new UIPBase(<Element>child));
    }
  }

  appendChild(child: IUIPiece) {
    if (child.root) {
      super.appendChild(child);
      this.parent.appendChild(child.root);
    }
    return this;
  }

  removeChild(child: IUIPiece): boolean {
    if (super.removeChild(child)) {
      if (child.root) {
        this.parent.removeChild(child.root);
      }
      return true;
    } else {
      return false;
    }
  }

  replaceChild(newChild: IUIPiece, oldChild: IUIPiece): IUIPiece {
    super.replaceChild(newChild, oldChild);

    if (newChild.root && oldChild.root) {
      this.parent.replaceChild(newChild.root, oldChild.root);
    }

    return this;
  }

  insertChild(newChild: IUIPiece, referenceChild: IUIPiece, after?: boolean | undefined) {
    // append ?
    if (this.length == 0 || (after && referenceChild === this.lastChild)) {
      super.appendChild(newChild);
      this.parent.appendChild(newChild.root);
      return this;
    }

    // insert after
    const nextNode = this._children.findNext(referenceChild);
    super.insertChild(newChild, referenceChild, after);
    if (after) {
      if (nextNode) {
        this.parent.insertBefore(newChild.root, nextNode.data.root.nextSibling);
      } else {
        throw "Reference child not found";
      }
    } else {
      this.parent.insertBefore(newChild.root, referenceChild.root);
    }

    return this;
  }

  clearChildren(): IUIPiece {
    super.clearChildren();
    removeAllChildren(this.parent);
    return this;
  }
}
