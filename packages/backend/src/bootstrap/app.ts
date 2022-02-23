import * as path from 'path';
import jwt from 'express-jwt';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { TNullable, defConf } from '@demo/app-common';
import { AppInterceptor } from './app-interceptor';
import * as appTracer from './app-request-tracer';
import {V1Router } from '../application/workflows/v1-router';

const _PUBLIC_PATH = '../../../../public';


export class App {

	private _app: TNullable<express.Application> = null;
	private _jwtCheck = jwt({
		secret: defConf.TOKEN_SECRET,
		algorithms: ['HS256'],
		requestProperty: 'user',
	});

	constructor() {
		this._app = express();
		this._init();
	}

	get app(): express.Application {
		if (!this._app) {
			throw new Error('Application is null');
		}
		return this._app;
	}

	private _init = (): void => {
		if (!this._app) {
			throw new Error('Application is null');
		}
		this._app.use('/api-docs', express.static(path.resolve(<string>require.main?.path || __dirname, `${_PUBLIC_PATH}/api-docs`)));
		this._app.use(express.json({ limit: '10mb' }));
		this._app.use(express.urlencoded({ extended: false }));
		this._app.use(appTracer.handle());
		this._app.use(AppInterceptor.beforeHandler);
		
		const v1Router = new V1Router();

		// token handle
		this._app.use('/', this._jwtCheck.unless({path: [
			'/api/v1',
			'/api/v1/client-auth'
		]}));
		this._app.use(v1Router.prefix, v1Router.router);
		this._app.use(AppInterceptor.completeHandler);
		this._app.use(AppInterceptor.notFoundHandler);
		this._app.use(AppInterceptor.errorHandler);
	}
}
