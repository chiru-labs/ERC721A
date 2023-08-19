#include <node.h>
#include <nan.h>

extern "C" {
#if LIBKECCAK == 32
  #include "libkeccak-32/KeccakSpongeWidth1600.h"
#elif LIBKECCAK == 64
  #include "libkeccak-64/KeccakSpongeWidth1600.h"
#else
  #error "LIBKECCAK not defined correctly"
#endif
}

class KeccakWrapper : public Nan::ObjectWrap {
 public:
  static v8::Local<v8::Function> Init () {
    Nan::EscapableHandleScope scope;

    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("KeccakWrapper").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(tpl, "initialize", Initialize);
    Nan::SetPrototypeMethod(tpl, "absorb", Absorb);
    Nan::SetPrototypeMethod(tpl, "absorbLastFewBits", AbsorbLastFewBits);
    Nan::SetPrototypeMethod(tpl, "squeeze", Squeeze);
    Nan::SetPrototypeMethod(tpl, "copy", Copy);

    return scope.Escape(Nan::GetFunction(tpl).ToLocalChecked());
  }

 private:
  KeccakWidth1600_SpongeInstance sponge;

  static NAN_METHOD(New) {
    KeccakWrapper* obj = new KeccakWrapper();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  }

  static NAN_METHOD(Initialize) {
    KeccakWrapper* obj = Nan::ObjectWrap::Unwrap<KeccakWrapper>(info.Holder());
#if (NODE_MODULE_VERSION >= NODE_7_0_MODULE_VERSION)
    unsigned int rate = info[0]->IntegerValue(info.GetIsolate()->GetCurrentContext()).ToChecked();
    unsigned int capacity = info[1]->IntegerValue(info.GetIsolate()->GetCurrentContext()).ToChecked();
#else
    unsigned int rate = info[0]->IntegerValue();
    unsigned int capacity = info[1]->IntegerValue();
#endif

    // ignore return code, rate & capacity always will right because internal object
    KeccakWidth1600_SpongeInitialize(&obj->sponge, rate, capacity);
  }

  static NAN_METHOD(Absorb) {
    KeccakWrapper* obj = Nan::ObjectWrap::Unwrap<KeccakWrapper>(info.Holder());
    v8::Local<v8::Object> buffer = info[0].As<v8::Object>();
    const unsigned char* data = (const unsigned char*) node::Buffer::Data(buffer);
    size_t length = node::Buffer::Length(buffer);

    // ignore return code, bcause internal object
    KeccakWidth1600_SpongeAbsorb(&obj->sponge, data, length);
  }

  static NAN_METHOD(AbsorbLastFewBits) {
    KeccakWrapper* obj = Nan::ObjectWrap::Unwrap<KeccakWrapper>(info.Holder());
#if (NODE_MODULE_VERSION >= NODE_7_0_MODULE_VERSION)
    unsigned char bits = info[0]->IntegerValue(info.GetIsolate()->GetCurrentContext()).ToChecked();
#else
    unsigned char bits = info[0]->IntegerValue();
#endif

    // ignore return code, bcause internal object
    KeccakWidth1600_SpongeAbsorbLastFewBits(&obj->sponge, bits);
  }

  static NAN_METHOD(Squeeze) {
    KeccakWrapper* obj = Nan::ObjectWrap::Unwrap<KeccakWrapper>(info.Holder());
#if (NODE_MODULE_VERSION >= NODE_7_0_MODULE_VERSION)
    size_t length = info[0]->IntegerValue(info.GetIsolate()->GetCurrentContext()).ToChecked();
#else
    size_t length = info[0]->IntegerValue();
#endif

    v8::Local<v8::Object> buffer = Nan::NewBuffer(length).ToLocalChecked();
    unsigned char* data = (unsigned char*) node::Buffer::Data(buffer);

    KeccakWidth1600_SpongeSqueeze(&obj->sponge, data, length);
    info.GetReturnValue().Set(buffer);
  }

  static NAN_METHOD(Copy) {
    KeccakWrapper* from = Nan::ObjectWrap::Unwrap<KeccakWrapper>(info.Holder());
#if (NODE_MODULE_VERSION >= NODE_7_0_MODULE_VERSION)
    KeccakWrapper* to = Nan::ObjectWrap::Unwrap<KeccakWrapper>(info[0]->ToObject(info.GetIsolate()->GetCurrentContext()).ToLocalChecked());
#else
    KeccakWrapper* to = Nan::ObjectWrap::Unwrap<KeccakWrapper>(info[0]->ToObject());
#endif

    memcpy(&to->sponge, &from->sponge, sizeof(KeccakWidth1600_SpongeInstance));
  }
};

void Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE exports, Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE module) {
  // I wish to use pure functions, but we need wrapper around state (KeccakWidth1600_SpongeInstance)
  Nan::Set(module, Nan::New("exports").ToLocalChecked(), KeccakWrapper::Init());
}

NODE_MODULE(keccak, Init)
