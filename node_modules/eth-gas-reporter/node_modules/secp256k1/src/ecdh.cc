#include <node.h>
#include <nan.h>
#include <secp256k1.h>
#include <secp256k1_ecdh.h>

#include "messages.h"
#include "util.h"

extern secp256k1_context* secp256k1ctx;

NAN_METHOD(ecdh) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> pubkey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBLIC_KEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH2(pubkey_buffer, 33, 65, EC_PUBLIC_KEY_LENGTH_INVALID);
  const unsigned char* public_key_input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
  size_t public_key_input_length = node::Buffer::Length(pubkey_buffer);

  v8::Local<v8::Object> private_key_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(private_key_buffer, EC_PRIVATE_KEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(private_key_buffer, 32, EC_PRIVATE_KEY_LENGTH_INVALID);
  const unsigned char* private_key = (const unsigned char*) node::Buffer::Data(private_key_buffer);

  secp256k1_pubkey public_key;
  if (secp256k1_ec_pubkey_parse(secp256k1ctx, &public_key, public_key_input, public_key_input_length) == 0) {
    return Nan::ThrowError(EC_PUBLIC_KEY_PARSE_FAIL);
  }

  unsigned char output[32];
  if (secp256k1_ecdh(secp256k1ctx, &output[0], &public_key, private_key, secp256k1_ecdh_hash_function_sha256, NULL) == 0) {
    return Nan::ThrowError(ECDH_FAIL);
  }

  info.GetReturnValue().Set(COPY_BUFFER(&output[0], 32));
}

int ecdh_hash_function_unsafe(unsigned char *output, const unsigned char *x, const unsigned char *y, void *data) {
  output[0] = 0x04;
  memcpy(output + 1, x, 32);
  memcpy(output + 33, y, 32);
  return 1;
}

NAN_METHOD(ecdhUnsafe) {
  Nan::HandleScope scope;

  v8::Local<v8::Object> pubkey_buffer = info[0].As<v8::Object>();
  CHECK_TYPE_BUFFER(pubkey_buffer, EC_PUBLIC_KEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH2(pubkey_buffer, 33, 65, EC_PUBLIC_KEY_LENGTH_INVALID);
  const unsigned char* public_key_input = (unsigned char*) node::Buffer::Data(pubkey_buffer);
  size_t public_key_input_length = node::Buffer::Length(pubkey_buffer);

  v8::Local<v8::Object> private_key_buffer = info[1].As<v8::Object>();
  CHECK_TYPE_BUFFER(private_key_buffer, EC_PRIVATE_KEY_TYPE_INVALID);
  CHECK_BUFFER_LENGTH(private_key_buffer, 32, EC_PRIVATE_KEY_LENGTH_INVALID);
  const unsigned char* private_key = (const unsigned char*) node::Buffer::Data(private_key_buffer);

  secp256k1_pubkey public_key;
  if (secp256k1_ec_pubkey_parse(secp256k1ctx, &public_key, public_key_input, public_key_input_length) == 0) {
    return Nan::ThrowError(EC_PUBLIC_KEY_PARSE_FAIL);
  }

  unsigned int flags = SECP256K1_EC_COMPRESSED;
  UPDATE_COMPRESSED_VALUE(flags, info[2], SECP256K1_EC_COMPRESSED, SECP256K1_EC_UNCOMPRESSED);

  unsigned char output[65];
  size_t output_length = flags == SECP256K1_EC_COMPRESSED ? 33 : 65;

  if (secp256k1_ecdh(secp256k1ctx, &output[0], &public_key, private_key, ecdh_hash_function_unsafe, NULL) == 0) {
    return Nan::ThrowError(ECDH_FAIL);
  }

  if (output_length == 33) {
    if (secp256k1_ec_pubkey_parse(secp256k1ctx, &public_key, output, 65) == 0) {
      return Nan::ThrowError(EC_PUBLIC_KEY_PARSE_FAIL);
    }

    secp256k1_ec_pubkey_serialize(secp256k1ctx, &output[0], &output_length, &public_key, flags);
  }

  info.GetReturnValue().Set(COPY_BUFFER(&output[0], output_length));
}
