/*
 * Copyright (c) 2007-2008 by Evernote Corporation, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.    
 */

/*
 * This file contains the EDAM protocol interface for operations to query
 * and/or authenticate users.
 */

include "Types.thrift"
include "Errors.thrift"

namespace as3 com.evernote.edam.userstore
namespace java com.evernote.edam.userstore
namespace csharp Evernote.EDAM.UserStore
namespace py evernote.edam.userstore
namespace cpp evernote.edam
namespace rb Evernote.EDAM.UserStore
namespace php edam_userstore
namespace cocoa EDAM
namespace perl EDAMUserStore


/**
 * The major version number for the current revision of the EDAM protocol.
 * Clients pass this to the service using UserStore.checkVersion at the
 * beginning of a session to confirm that they are not out of date.
 */
const i16 EDAM_VERSION_MAJOR = 1

/**
 * The minor version number for the current revision of the EDAM protocol.
 * Clients pass this to the service using UserStore.checkVersion at the
 * beginning of a session to confirm that they are not out of date.
 */
const i16 EDAM_VERSION_MINOR = 19


/**
 * This structure is used to provide publicly-available user information
 * about a particular account.
 *<dl>
 * <dt>userId:</dt>
 *   <dd>
 *   The unique numeric user identifier for the user account.
 *   </dd>
 * <dt>shardId:</dt>
 *   <dd>
 *   The name of the virtual server that manages the state of
 *   this user. This value is used internally to determine which system should
 *   service requests about this user's data.  It is also used to construct
 *   the appropriate URL to make requests from the NoteStore.
 *   </dd>
 * <dt>privilege:</dt>
 *   <dd>
 *   The privilege level of the account, to determine whether
 *   this is a Premium or Free account.
 *   </dd>
 * </dl> 
 */
struct PublicUserInfo {
  1:  required  Types.UserID userId,
  2:  required  string shardId,
  3:  optional  Types.PrivilegeLevel privilege,
  4:  optional  string username
}


/**
 * When an authentication (or re-authentication) is performed, this structure
 * provides the result to the client.
 *<dl>
 * <dt>currentTime:</dt>
 *   <dd>
 *   The server-side date and time when this result was
 *   generated.
 *   </dd>
 * <dt>authenticationToken:</dt>
 *   <dd>
 *   Holds an opaque, ASCII-encoded token that can be
 *   used by the client to perform actions on a NoteStore.
 *   </dd>
 * <dt>expiration:</dt>
 *   <dd>
 *   Holds the server-side date and time when the
 *   authentication token will expire.
 *   This time can be compared to "currentTime" to produce an expiration
 *   time that can be reconciled with the client's local clock.
 *   </dd>
 * <dt>user:</dt>
 *   <dd>
 *   Holds the information about the account which was 
 *   authenticated if this was a full authentication.  May be absent if this
 *   particular authentication did not require user information.
 *   </dd>
 * <dt>publicUserInfo:</dt>
 *   <dd>
 *   If this authentication result was achieved without full permissions to
 *   access the full User structure, this field may be set to give back
 *   a more limited public set of data.
 *   </dd>
 * </dl>
 */
struct AuthenticationResult {
  1:  required  Types.Timestamp currentTime,
  2:  required  string authenticationToken,  
  3:  required  Types.Timestamp expiration,
  4:  optional  Types.User user,
  5:  optional  PublicUserInfo publicUserInfo
}


/**
 * Service:  UserStore
 * <p>
 * The UserStore service is primarily used by EDAM clients to establish
 * authentication via username and password over a trusted connection (e.g.
 * SSL).  A client's first call to this interface should be checkVersion() to
 * ensure that the client's software is up to date.
 * </p>
 * All calls which require an authenticationToken may throw an 
 * EDAMUserException for the following reasons: 
 *  <ul>
 *   <li> AUTH_EXPIRED "authenticationToken" - token has expired
 *   <li> BAD_DATA_FORMAT "authenticationToken" - token is malformed
 *   <li> DATA_REQUIRED "authenticationToken" - token is empty
 *   <li> INVALID_AUTH "authenticationToken" - token signature is invalid
 * </ul>
 */
service UserStore {

  /**
   * This should be the first call made by a client to the EDAM service.  It
   * tells the service what protocol version is used by the client.  The
   * service will then return true if the client is capable of talking to
   * the service, and false if the client's protocol version is incompatible
   * with the service, so the client must upgrade.  If a client receives a
   * false value, it should report the incompatibility to the user and not
   * continue with any more EDAM requests (UserStore or NoteStore).
   *
   * @param clientName
   *   This string provides some information about the client for
   *   tracking/logging on the service.  It should provide information about
   *   the client's software and platform.  The structure should be:
   *   application/version; platform/version; [ device/version ]
   *   E.g.   "Evernote Windows/3.0.1; Windows/XP SP3" or
   *   "Evernote Clipper/1.0.1; JME/2.0; Motorola RAZR/2.0;
   *
   * @param edamVersionMajor
   *   This should be the major protocol version that was compiled by the
   *   client.  This should be the current value of the EDAM_VERSION_MAJOR
   *   constant for the client.
   *
   * @param edamVersionMinor
   *   This should be the major protocol version that was compiled by the
   *   client.  This should be the current value of the EDAM_VERSION_MINOR
   *   constant for the client.
   */
  bool checkVersion(1: string clientName,
                    2: i16 edamVersionMajor = EDAM_VERSION_MAJOR,
                    3: i16 edamVersionMinor = EDAM_VERSION_MINOR),

  /**
   * This is used to check a username and password in order to create an
   * authentication session that could be used for further actions.
   *
   * @param username
   *   The username (not numeric user ID) for the account to
   *   authenticate against.  This function will also accept the user's
   *   registered email address in this parameter.
   *
   * @param password
   *   The plaintext password to check against the account.  Since
   *   this is not protected by the EDAM protocol, this information must be
   *   provided over a protected transport (e.g. SSL).
   *
   * @param consumerKey
   *   A unique identifier for this client application, provided by Evernote
   *   to developers who request an API key.  This must be provided to identify
   *   the client.
   *
   * @param consumerSecret
   *   If the client was given a "consumer secret" when the API key was issued,
   *   it must be provided here to authenticate the application itself.
   *
   * @return
   *   The result of the authentication.  If the authentication was successful,
   *   the AuthenticationResult.user field will be set with the full information
   *   about the User.
   *
   * @throws EDAMUserException <ul>
   *   <li> DATA_REQUIRED "username" - username is empty 
   *   <li> DATA_REQUIRED "password" - password is empty
   *   <li> DATA_REQUIRED "consumerKey" - consumerKey is empty
   *   <li> INVALID_AUTH "username" - username not found
   *   <li> INVALID_AUTH "password" - password did not match
   *   <li> INVALID_AUTH "consumerKey" - consumerKey is not authorized
   *   <li> INVALID_AUTH "consumerSecret" - consumerSecret is incorrect
   *   <li> PERMISSION_DENIED "User.active" - user account is closed
   *   <li> PERMISSION_DENIED "User.tooManyFailuresTryAgainLater" - user has failed authentication too often
   * </ul>
   */
  AuthenticationResult authenticate(1: string username,
                                    2: string password,
                                    3: string consumerKey,
                                    4: string consumerSecret)
    throws (1: Errors.EDAMUserException userException,
            2: Errors.EDAMSystemException systemException),

  /**
   * This is used to take an existing authentication token (returned from
   * 'authenticate') and exchange it for a newer token which will not expire
   * as soon.  This must be invoked before the previous token expires.
   *
   * @param authenticationToken
   *   The previous authentication token from the authenticate() result.
   *
   * @return
   *   The result of the authentication, with the new token in
   *   the result's "authentication" field.  The User field will
   *   not be set in the reply.
   */
  AuthenticationResult refreshAuthentication(1: string authenticationToken)
    throws (1: Errors.EDAMUserException userException,
            2: Errors.EDAMSystemException systemException),

  /**
   * Returns the User corresponding to the provided authentication token,
   * or throws an exception if this token is not valid.
   * The level of detail provided in the returned User structure depends on
   * the access level granted by the token, so a web service client may receive
   * fewer fields than an integrated desktop client.
   */    
  Types.User getUser(1: string authenticationToken)
    throws (1: Errors.EDAMUserException userException,
            2: Errors.EDAMSystemException systemException),

  /**
   * Asks the UserStore about the publicly available location information for
   * a particular username.
   *
   * @throws EDAMUserException <ul>
   *   <li> DATA_REQUIRED "username" - username is empty 
   * </ul>
   */
  PublicUserInfo getPublicUserInfo(1: string username)
    throws (1: Errors.EDAMNotFoundException notFoundException,
    	    2: Errors.EDAMSystemException systemException,
    	    3: Errors.EDAMUserException userException)

}