export { default as home_dir } from 'https://deno.land/x/dir@1.5.1/home_dir/mod.ts';

import k8s from 'https://esm.sh/@kubernetes/client-node@0.18.1';
export { k8s };

import AWS from 'https://esm.sh/aws-sdk@2.1229.0';
const EC2 = AWS.EC2;
export { AWS, EC2 };
