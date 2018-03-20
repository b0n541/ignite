/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const IgniteClient = require('apache-ignite-client');
const ObjectType = IgniteClient.ObjectType;
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;

const ENDPOINT = '127.0.0.1:10800';

const PAUSE_MS = 5000;
const CACHE_NAME = 'test_cache';

// description - TBD 
class CachePutGetExample {
    constructor() {
        this._cache = null;
    }
  
    async putGetValues() {
        // put multiple values in parallel
        await Promise.all([
            await this._cache.put(0, this.getValue(0)),
            await this._cache.put(1, this.getValue(1)),
            await this._cache.put(2, this.getValue(2))
        ]);
        console.log('Cache values put successfully');

        let value;
        // get values sequentially
        for (let key = 0; key < 3; key++) {
            value = await this._cache.get(key);
            if (value !== this.getValue(key)) {
                console.log('Unexpected cache value!');
                return;
            }
        }
        console.log('Cache values get successfully');

        await this.pause();
        await this.putGetValues();
    }

    async start() {
        const igniteClient = new IgniteClient();
        try {
            await igniteClient.connect(
                new IgniteClientConfiguration(ENDPOINT), this.onDisconnect);
            console.log('Client is statrted');

            this._cache = (await igniteClient.getOrCreateCache(CACHE_NAME)).
                setKeyType(ObjectType.TYPE_CODE.INTEGER).
                setValueType(ObjectType.TYPE_CODE.STRING);

            await this.putGetValues();
        }
        catch (err) {
            console.log(err.message);
        }
        finally {
            igniteClient.disconnect();
        }
    }

    getValue(key) {
        return 'value' + key;
    }

    async pause() {
        return new Promise(resolve => setTimeout(resolve, PAUSE_MS));
    }

    async onDisconnect(error) {
        console.log('Client is stopped');
        if (error) {
            console.log(error.message);
        }
    }
}

const cachePutGetExample = new CachePutGetExample();
cachePutGetExample.start();
