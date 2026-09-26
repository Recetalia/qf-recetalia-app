import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { AppUpdateService } from './app-update.service';

describe('AppUpdateService', () => {
  let eventos: Subject<VersionEvent>;
  let sw: jasmine.SpyObj<SwUpdate> & { versionUpdates: Subject<VersionEvent> };

  function crear(enabled: boolean, plataforma = 'browser') {
    eventos = new Subject<VersionEvent>();
    sw = {
      isEnabled: enabled,
      versionUpdates: eventos,
      activateUpdate: jasmine.createSpy('activateUpdate').and.returnValue(Promise.resolve(true)),
      checkForUpdate: jasmine.createSpy('checkForUpdate').and.returnValue(Promise.resolve(false)),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        { provide: SwUpdate, useValue: sw },
        { provide: PLATFORM_ID, useValue: plataforma },
      ],
    });
    return TestBed.inject(AppUpdateService);
  }

  it('con una versión nueva lista, la activa y recarga', async () => {
    const recargar = jasmine.createSpy('recargar');
    crear(true).iniciar(recargar);
    eventos.next({ type: 'VERSION_READY', currentVersion: { hash: 'a' }, latestVersion: { hash: 'b' } } as VersionEvent);
    await Promise.resolve();
    expect(sw.activateUpdate).toHaveBeenCalled();
    await Promise.resolve();
    expect(recargar).toHaveBeenCalled();
  });

  it('revisa si hay versión nueva al arrancar', () => {
    crear(true).iniciar(() => {});
    expect(sw.checkForUpdate).toHaveBeenCalled();
  });

  it('otros eventos no recargan', async () => {
    const recargar = jasmine.createSpy('recargar');
    crear(true).iniciar(recargar);
    eventos.next({ type: 'VERSION_DETECTED', version: { hash: 'b' } } as VersionEvent);
    await Promise.resolve();
    expect(recargar).not.toHaveBeenCalled();
  });

  it('sin service worker (dev) o en el servidor (SSR) no hace nada', () => {
    crear(false).iniciar(() => {});
    expect(sw.checkForUpdate).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    crear(true, 'server').iniciar(() => {});
    expect(sw.checkForUpdate).not.toHaveBeenCalled();
  });
});
