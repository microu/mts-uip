export interface IUIPiece {
  readonly root: Element;
  children: ()=>Iterable<IUIPiece>;
  length: number;
}

export interface IUIPParent extends IUIPiece {
  firstChild: IUIPiece | undefined;
  lastChild: IUIPiece | undefined;

  appendChild: (child: IUIPiece) => IUIPiece;
  // returns: this

  removeChild: (child: IUIPiece) => boolean;
  // returns: true if the child was found and deleted else false

  replaceChild: (newChild: IUIPiece, oldChild: IUIPiece) => IUIPiece;
  // returns: this

  insertChild: (newChild: IUIPiece, referenceChild: IUIPiece, after?: boolean) => IUIPiece;
  // returns: this
  // after defaults to false

  clearChildren: () => IUIPiece;
  // returns: this
}

export interface IUIPSlots<K=string> extends IUIPiece {

  first: K | undefined;
  last: K | undefined;
  length: number;

  setSlot(
    name: K,
    child: IUIPiece,
    referenceName?: K,
    after?: boolean
  ): IUIPSlots<K>;
  // set in place, add or move
  // returns: this

  moveSlot(name: K, referenceName: K, after?: boolean): IUIPSlots<K>;

  renameSlot(prevName: K, newName: K): IUIPSlots<K>;
  // returns: this

  getSlot(name: K): IUIPiece | undefined;
  // returns: child | null

  removeSlot(name: K): IUIPiece | undefined;
  // returns: removed

  clearSlots(): IUIPSlots<K>;

  hasSlot(name: K): boolean;

  entries(): Iterable<[K, IUIPiece]>;
}
