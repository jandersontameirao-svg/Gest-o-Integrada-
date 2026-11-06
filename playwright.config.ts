import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',workers:1,retries:0,timeout:90000,use:{baseURL:'http://127.0.0.1:3001',trace:'retain-on-failure'},webServer:{command:'npm start',url:'http://127.0.0.1:3001/api/v1/health',reuseExistingServer:false,timeout:30000},reporter:[['list'],['html',{open:'never'}]]});
