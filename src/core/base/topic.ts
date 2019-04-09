import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


export class Topic {
  private _subjects: {[key: string]: Subject<any>};

  constructor() {
    this._subjects = {};
  }

  protected _def<_Type>(subject: string): Topic {
    this._subjects[subject] = new Subject<_Type>();
    return this;
  }

  protected _emit<_Type>(subject: string, data?: _Type): Topic {
    if (subject in this._subjects)
      this._subjects[subject].next(data);
    return this;
  }

  public on(subject: string): Observable<any> { return this._subjects[subject]; }
  public get subjects(): string[] { return Object.keys(this._subjects); }

  public cleanup() {
    Object.entries(this._subjects).forEach(([sub, ject]) => {
      ject.unsubscribe();
      this._def(sub);
    });
  }
}
