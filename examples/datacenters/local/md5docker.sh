#!/bin/sh

docker create $1 | {
  read cid
  docker export $cid | tar Oxv 2>&1 | shasum -a 256
  docker rm $cid > /dev/null
}