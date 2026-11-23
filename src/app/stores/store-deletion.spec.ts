import { TestBed } from '@angular/core/testing';
import { StoreDeletion } from './store-deletion';
import { StoreService } from './store.service';

describe('StoreDeletion', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [StoreDeletion] }).compileComponents());

  it('does not delete until confirmed', () => {
    const fixture = TestBed.createComponent(StoreDeletion);
    const svc = TestBed.inject(StoreService);
    const before = svc.stores().length;
    fixture.componentInstance.requestDelete(svc.stores()[0]);
    expect(svc.stores().length).toBe(before);
    fixture.componentInstance.cancel();
    expect(svc.stores().length).toBe(before);
    expect(fixture.componentInstance.pending()).toBeNull();
  });

  it('deletes the store after confirmation', () => {
    const fixture = TestBed.createComponent(StoreDeletion);
    const svc = TestBed.inject(StoreService);
    const target = svc.stores()[0];
    const before = svc.stores().length;
    fixture.componentInstance.requestDelete(target);
    fixture.componentInstance.confirm();
    expect(svc.stores().length).toBe(before - 1);
    expect(svc.stores().some((s) => s.id === target.id)).toBe(false);
    expect(fixture.componentInstance.message()).toContain(target.name);
  });

  it('returns false when deleting an unknown id', () => {
    expect(TestBed.inject(StoreService).delete(999)).toBe(false);
  });
});
