const proto = `syntax = "proto3";

service ArcctlPulumi {
  rpc Build(BuildRequest) returns (BuildResponse) {}
  rpc Apply(ApplyRequest) returns (ApplyResponse) {}
}

message BuildRequest {
  string directory = 1;
}

message BuildResponse {
  string image = 1;
}

message ApplyRequest {
  string pulumistate = 1;
  string datacenterid = 2;
  string image = 3;
  map<string, string> inputs = 4;
  bool destroy = 5;
}

message ApplyResponse {
  string pulumistate = 1;
}`;

export default proto;
