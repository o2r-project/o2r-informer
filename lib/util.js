/*
 * (C) Copyright 2017 o2r project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * turns a string like "a.b.c" into a object "{a:{b:{c: value}}}"
 * @param  {string} str string with object path
 * @param  {Object} val value of the referenced object.
 * @return {Object}     new object according to path with the provided value set.
 */
function objectify(str, val) {
  let obj = {}
  str.split('.').reduce(function (cur, next, i, arr) {
    if (!cur[next]) cur[next] = {}
    if (i === arr.length - 1) cur[next] = val
    return cur[next]
  }, obj)
  return obj
}

/**
 * merge all fields from obj2 into obj1 and return obj1
 * @param  {Object} obj1 object
 * @param  {Object} obj2 object
 * @return {Object} object containing obj1 and all fields of obj2
 */
function merge(obj1, obj2) {
  for (var attr in obj2) {
    obj1[attr] = obj2[attr]
  }
  return obj1
}

module.exports = {
    objectify,
    merge
};