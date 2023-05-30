// https://www.terraform.io/docs/providers/postgresql
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface PostgresqlProviderConfig {
  /**
  * Use rds_iam instead of password authentication (see: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html)
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#aws_rds_iam_auth PostgresqlProvider#aws_rds_iam_auth}
  */
  readonly awsRdsIamAuth?: boolean | cdktf.IResolvable;
  /**
  * AWS profile to use for IAM auth
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#aws_rds_iam_profile PostgresqlProvider#aws_rds_iam_profile}
  */
  readonly awsRdsIamProfile?: string;
  /**
  * AWS region to use for IAM auth
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#aws_rds_iam_region PostgresqlProvider#aws_rds_iam_region}
  */
  readonly awsRdsIamRegion?: string;
  /**
  * Maximum wait for connection, in seconds. Zero or not specified means wait indefinitely.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#connect_timeout PostgresqlProvider#connect_timeout}
  */
  readonly connectTimeout?: number;
  /**
  * The name of the database to connect to in order to conenct to (defaults to `postgres`).
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#database PostgresqlProvider#database}
  */
  readonly database?: string;
  /**
  * Database username associated to the connected user (for user name maps)
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#database_username PostgresqlProvider#database_username}
  */
  readonly databaseUsername?: string;
  /**
  * Specify the expected version of PostgreSQL.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#expected_version PostgresqlProvider#expected_version}
  */
  readonly expectedVersion?: string;
  /**
  * Name of PostgreSQL server address to connect to
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#host PostgresqlProvider#host}
  */
  readonly host?: string;
  /**
  * Maximum number of connections to establish to the database. Zero means unlimited.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#max_connections PostgresqlProvider#max_connections}
  */
  readonly maxConnections?: number;
  /**
  * Password to be used if the PostgreSQL server demands password authentication
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#password PostgresqlProvider#password}
  */
  readonly password?: string;
  /**
  * The PostgreSQL port number to connect to at the server host, or socket file name extension for Unix-domain connections
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#port PostgresqlProvider#port}
  */
  readonly port?: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#scheme PostgresqlProvider#scheme}
  */
  readonly scheme?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#ssl_mode PostgresqlProvider#ssl_mode}
  */
  readonly sslMode?: string;
  /**
  * This option determines whether or with what priority a secure SSL TCP/IP connection will be negotiated with the PostgreSQL server
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#sslmode PostgresqlProvider#sslmode}
  */
  readonly sslmode?: string;
  /**
  * The SSL server root certificate file path. The file must contain PEM encoded data.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#sslrootcert PostgresqlProvider#sslrootcert}
  */
  readonly sslrootcert?: string;
  /**
  * Specify if the user to connect as is a Postgres superuser or not.If not, some feature might be disabled (e.g.: Refreshing state password from Postgres)
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#superuser PostgresqlProvider#superuser}
  */
  readonly superuser?: boolean | cdktf.IResolvable;
  /**
  * PostgreSQL user name to connect as
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#username PostgresqlProvider#username}
  */
  readonly username?: string;
  /**
  * Alias name
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#alias PostgresqlProvider#alias}
  */
  readonly alias?: string;
  /**
  * clientcert block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#clientcert PostgresqlProvider#clientcert}
  */
  readonly clientcert?: PostgresqlProviderClientcert;
}
export interface PostgresqlProviderClientcert {
  /**
  * The SSL client certificate file path. The file must contain PEM encoded data.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#cert PostgresqlProvider#cert}
  */
  readonly cert: string;
  /**
  * The SSL client certificate private key file path. The file must contain PEM encoded data.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql#key PostgresqlProvider#key}
  */
  readonly key: string;
}

export function postgresqlProviderClientcertToTerraform(struct?: PostgresqlProviderClientcert): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    cert: cdktf.stringToTerraform(struct!.cert),
    key: cdktf.stringToTerraform(struct!.key),
  }
}


/**
* Represents a {@link https://www.terraform.io/docs/providers/postgresql postgresql}
*/
export class PostgresqlProvider extends cdktf.TerraformProvider {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "postgresql";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/postgresql postgresql} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options PostgresqlProviderConfig = {}
  */
  public constructor(scope: Construct, id: string, config: PostgresqlProviderConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'postgresql',
      terraformGeneratorMetadata: {
        providerName: 'postgresql',
        providerVersion: '1.19.0',
        providerVersionConstraint: '1.19.0'
      },
      terraformProviderSource: 'cyrilgdn/postgresql'
    });
    this._awsRdsIamAuth = config.awsRdsIamAuth;
    this._awsRdsIamProfile = config.awsRdsIamProfile;
    this._awsRdsIamRegion = config.awsRdsIamRegion;
    this._connectTimeout = config.connectTimeout;
    this._database = config.database;
    this._databaseUsername = config.databaseUsername;
    this._expectedVersion = config.expectedVersion;
    this._host = config.host;
    this._maxConnections = config.maxConnections;
    this._password = config.password;
    this._port = config.port;
    this._scheme = config.scheme;
    this._sslMode = config.sslMode;
    this._sslmode = config.sslmode;
    this._sslrootcert = config.sslrootcert;
    this._superuser = config.superuser;
    this._username = config.username;
    this._alias = config.alias;
    this._clientcert = config.clientcert;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // aws_rds_iam_auth - computed: false, optional: true, required: false
  private _awsRdsIamAuth?: boolean | cdktf.IResolvable; 
  public get awsRdsIamAuth() {
    return this._awsRdsIamAuth;
  }
  public set awsRdsIamAuth(value: boolean | cdktf.IResolvable | undefined) {
    this._awsRdsIamAuth = value;
  }
  public resetAwsRdsIamAuth() {
    this._awsRdsIamAuth = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get awsRdsIamAuthInput() {
    return this._awsRdsIamAuth;
  }

  // aws_rds_iam_profile - computed: false, optional: true, required: false
  private _awsRdsIamProfile?: string; 
  public get awsRdsIamProfile() {
    return this._awsRdsIamProfile;
  }
  public set awsRdsIamProfile(value: string | undefined) {
    this._awsRdsIamProfile = value;
  }
  public resetAwsRdsIamProfile() {
    this._awsRdsIamProfile = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get awsRdsIamProfileInput() {
    return this._awsRdsIamProfile;
  }

  // aws_rds_iam_region - computed: false, optional: true, required: false
  private _awsRdsIamRegion?: string; 
  public get awsRdsIamRegion() {
    return this._awsRdsIamRegion;
  }
  public set awsRdsIamRegion(value: string | undefined) {
    this._awsRdsIamRegion = value;
  }
  public resetAwsRdsIamRegion() {
    this._awsRdsIamRegion = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get awsRdsIamRegionInput() {
    return this._awsRdsIamRegion;
  }

  // connect_timeout - computed: false, optional: true, required: false
  private _connectTimeout?: number; 
  public get connectTimeout() {
    return this._connectTimeout;
  }
  public set connectTimeout(value: number | undefined) {
    this._connectTimeout = value;
  }
  public resetConnectTimeout() {
    this._connectTimeout = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get connectTimeoutInput() {
    return this._connectTimeout;
  }

  // database - computed: false, optional: true, required: false
  private _database?: string; 
  public get database() {
    return this._database;
  }
  public set database(value: string | undefined) {
    this._database = value;
  }
  public resetDatabase() {
    this._database = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get databaseInput() {
    return this._database;
  }

  // database_username - computed: false, optional: true, required: false
  private _databaseUsername?: string; 
  public get databaseUsername() {
    return this._databaseUsername;
  }
  public set databaseUsername(value: string | undefined) {
    this._databaseUsername = value;
  }
  public resetDatabaseUsername() {
    this._databaseUsername = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get databaseUsernameInput() {
    return this._databaseUsername;
  }

  // expected_version - computed: false, optional: true, required: false
  private _expectedVersion?: string; 
  public get expectedVersion() {
    return this._expectedVersion;
  }
  public set expectedVersion(value: string | undefined) {
    this._expectedVersion = value;
  }
  public resetExpectedVersion() {
    this._expectedVersion = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get expectedVersionInput() {
    return this._expectedVersion;
  }

  // host - computed: false, optional: true, required: false
  private _host?: string; 
  public get host() {
    return this._host;
  }
  public set host(value: string | undefined) {
    this._host = value;
  }
  public resetHost() {
    this._host = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get hostInput() {
    return this._host;
  }

  // max_connections - computed: false, optional: true, required: false
  private _maxConnections?: number; 
  public get maxConnections() {
    return this._maxConnections;
  }
  public set maxConnections(value: number | undefined) {
    this._maxConnections = value;
  }
  public resetMaxConnections() {
    this._maxConnections = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get maxConnectionsInput() {
    return this._maxConnections;
  }

  // password - computed: false, optional: true, required: false
  private _password?: string; 
  public get password() {
    return this._password;
  }
  public set password(value: string | undefined) {
    this._password = value;
  }
  public resetPassword() {
    this._password = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get passwordInput() {
    return this._password;
  }

  // port - computed: false, optional: true, required: false
  private _port?: number; 
  public get port() {
    return this._port;
  }
  public set port(value: number | undefined) {
    this._port = value;
  }
  public resetPort() {
    this._port = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get portInput() {
    return this._port;
  }

  // scheme - computed: false, optional: true, required: false
  private _scheme?: string; 
  public get scheme() {
    return this._scheme;
  }
  public set scheme(value: string | undefined) {
    this._scheme = value;
  }
  public resetScheme() {
    this._scheme = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get schemeInput() {
    return this._scheme;
  }

  // ssl_mode - computed: false, optional: true, required: false
  private _sslMode?: string; 
  public get sslMode() {
    return this._sslMode;
  }
  public set sslMode(value: string | undefined) {
    this._sslMode = value;
  }
  public resetSslMode() {
    this._sslMode = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sslModeInput() {
    return this._sslMode;
  }

  // sslmode - computed: false, optional: true, required: false
  private _sslmode?: string; 
  public get sslmode() {
    return this._sslmode;
  }
  public set sslmode(value: string | undefined) {
    this._sslmode = value;
  }
  public resetSslmode() {
    this._sslmode = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sslmodeInput() {
    return this._sslmode;
  }

  // sslrootcert - computed: false, optional: true, required: false
  private _sslrootcert?: string; 
  public get sslrootcert() {
    return this._sslrootcert;
  }
  public set sslrootcert(value: string | undefined) {
    this._sslrootcert = value;
  }
  public resetSslrootcert() {
    this._sslrootcert = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sslrootcertInput() {
    return this._sslrootcert;
  }

  // superuser - computed: false, optional: true, required: false
  private _superuser?: boolean | cdktf.IResolvable; 
  public get superuser() {
    return this._superuser;
  }
  public set superuser(value: boolean | cdktf.IResolvable | undefined) {
    this._superuser = value;
  }
  public resetSuperuser() {
    this._superuser = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get superuserInput() {
    return this._superuser;
  }

  // username - computed: false, optional: true, required: false
  private _username?: string; 
  public get username() {
    return this._username;
  }
  public set username(value: string | undefined) {
    this._username = value;
  }
  public resetUsername() {
    this._username = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get usernameInput() {
    return this._username;
  }

  // alias - computed: false, optional: true, required: false
  private _alias?: string; 
  public get alias() {
    return this._alias;
  }
  public set alias(value: string | undefined) {
    this._alias = value;
  }
  public resetAlias() {
    this._alias = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get aliasInput() {
    return this._alias;
  }

  // clientcert - computed: false, optional: true, required: false
  private _clientcert?: PostgresqlProviderClientcert; 
  public get clientcert() {
    return this._clientcert;
  }
  public set clientcert(value: PostgresqlProviderClientcert | undefined) {
    this._clientcert = value;
  }
  public resetClientcert() {
    this._clientcert = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get clientcertInput() {
    return this._clientcert;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      aws_rds_iam_auth: cdktf.booleanToTerraform(this._awsRdsIamAuth),
      aws_rds_iam_profile: cdktf.stringToTerraform(this._awsRdsIamProfile),
      aws_rds_iam_region: cdktf.stringToTerraform(this._awsRdsIamRegion),
      connect_timeout: cdktf.numberToTerraform(this._connectTimeout),
      database: cdktf.stringToTerraform(this._database),
      database_username: cdktf.stringToTerraform(this._databaseUsername),
      expected_version: cdktf.stringToTerraform(this._expectedVersion),
      host: cdktf.stringToTerraform(this._host),
      max_connections: cdktf.numberToTerraform(this._maxConnections),
      password: cdktf.stringToTerraform(this._password),
      port: cdktf.numberToTerraform(this._port),
      scheme: cdktf.stringToTerraform(this._scheme),
      ssl_mode: cdktf.stringToTerraform(this._sslMode),
      sslmode: cdktf.stringToTerraform(this._sslmode),
      sslrootcert: cdktf.stringToTerraform(this._sslrootcert),
      superuser: cdktf.booleanToTerraform(this._superuser),
      username: cdktf.stringToTerraform(this._username),
      alias: cdktf.stringToTerraform(this._alias),
      clientcert: postgresqlProviderClientcertToTerraform(this._clientcert),
    };
  }
}
