#include "call_model/external_api/ZNotifyHttpSession.h"
#include "call_model/external_api/ZEkycHttpSession.h"

USING_NSP_CALL_MODEL();

class Test : public ZNotifyHttpSession::Callback {

	virtual void reponseTextToSpeech(const EkycApiResponse &response, const ZText2SpeechInfo::Ptr &textInfo) {

	}

	virtual void reponseDownloadFileAudio(const ZAudioDownloadInfo::Ptr &info) {
		std::cout << "file:" << info->targetFileName << std::endl;
	}

};

void onTest1() {

	Test test;
	ZNotifyHttpSession s(&test);
	ZText2SpeechInfo::Ptr info(new ZText2SpeechInfo());
	info->audio_id = "1";
	info->text = "Xin chào, tui là thảo.";
	info->targetDirectory = "/root/Desktop/wav";
	s.textToSpeech(info);
	s.textToSpeech(info);
	s.textToSpeech(info);

	while (true) {

	}

}

std::string getFile(std::string file) {
	std::ifstream input(file, std::ios::binary);

	std::vector<char> buffer(std::istreambuf_iterator<char>(input), {});
	return std::string(buffer.data(), buffer.size());
}

class EkycTest : public ZEkycHttpSession::CallBack {
public:

	virtual void reponseCheckIdCard(ZEkycHttpSession* session, const EkycApiResponse &response, const ZCheckIdCardInfo::Ptr &idCardInfo) {
		std::cout << "reponseCheckIdCard: " << response.toString() << std::endl;
		dem = 1;
	}

	virtual void reponseCheckLiveness(ZEkycHttpSession* session, const EkycApiResponse &response, const ZCheckLivenessInfo::Ptr &livenessInfo) {
		std::cout << "reponseCheckLiveness: " << response.toString() << std::endl;
		dem = 1;
	}

	virtual void reponseFaceQuality(ZEkycHttpSession* session, const EkycApiResponse &response, const ZCheckFaceQualityInfo::Ptr &faceImgInfo) {
		std::cout << "reponseFaceQuality: " << response.toString() << std::endl;
		dem = 1;
	}

	virtual void reponseVerifyWithIdCard(ZEkycHttpSession* session, const EkycApiResponse &response, const ZCheckFaceWithIdCardInfo::Ptr &faceInfo) {
		std::cout << "reponseVerifyWithIdCard: " << response.toString() << std::endl;
		dem = 1;

	}

	virtual void reponseVerifyWithAvatar(ZEkycHttpSession* session, const EkycApiResponse &response, const ZCheckFaceWithAvatarInfo::Ptr &faceInfo) {
		std::cout << "reponseVerifyWithAvatar: " << response.toString() << std::endl;
		dem = 1;
	}

	virtual void reponseTextToSpeech(ZEkycHttpSession* session, const EkycApiResponse &response, const ZText2SpeechInfo::Ptr &textInfo) {
	}
	int dem = 0;

};

void onTest() {

	EkycTest test;
	ZEkycHttpSession s(&test);
	s.reInit();
	std::cout << "reInit" << std::endl;

	while (!s.ready()) {
		Poco::Thread::sleep(50);
	}
	std::cout << "ready" << std::endl;

	std::string cmd;
	ZCheckIdCardInfo::Ptr idCardInfo;
	//	cmd = getFile("/root/Documents/image/id_card.jpg");
	//	idCardInfo.reset(new ZCheckIdCardInfo());
	//	idCardInfo->data = (void*) cmd.data();
	//	idCardInfo->len = cmd.length();
	//	idCardInfo->type = ZCheckIdCardInfo::IDCARD_TYPE::ID_CARD;
	//	idCardInfo->photo_id = "123";
	//
	//	s.checkIDCardIml(idCardInfo);
	//
	//	while (test.dem == 0) {
	//		Poco::Thread::sleep(50);
	//	}
	//
	//	cmd = getFile("/root/Documents/image/black.jpg");
	//	idCardInfo.reset(new ZCheckIdCardInfo());
	//	idCardInfo->data = (void*) cmd.data();
	//	idCardInfo->len = cmd.length();
	//	idCardInfo->type = ZCheckIdCardInfo::IDCARD_TYPE::BACK_IDCARD;
	//	idCardInfo->photo_id = "123";
	//	test.dem = 0;
	//	s.checkIDCardIml(idCardInfo);
	//	while (test.dem == 0) {
	//		Poco::Thread::sleep(50);
	//	}
	//
	//	cmd = getFile("/root/Documents/image/sefile.jpg");
	//	idCardInfo.reset(new ZCheckIdCardInfo());
	//	idCardInfo->data = (void*) cmd.data();
	//	idCardInfo->len = cmd.length();
	//	idCardInfo->type = ZCheckIdCardInfo::IDCARD_TYPE::SELFIE;
	//	idCardInfo->photo_id = "123";
	//	test.dem = 0;
	//	s.checkIDCardIml(idCardInfo);
	//	while (test.dem == 0) {
	//		Poco::Thread::sleep(50);
	//	}

	cmd = getFile("/root/Documents/image/sefile.jpg");
	ZCheckFaceQualityInfo::Ptr QualityInfo(new ZCheckFaceQualityInfo());
	QualityInfo->data = (void*) cmd.data();
	QualityInfo->len = cmd.length();
	QualityInfo->photo_id = "123";
	test.dem = 0;
	s.checkFaceQualityIml(QualityInfo);
	while (test.dem == 0) {
		Poco::Thread::sleep(50);
	}

	ZCheckLivenessInfo::Ptr LivenessInfo(new ZCheckLivenessInfo());
	LivenessInfo->data = (void*) cmd.data();
	LivenessInfo->len = cmd.length();
	test.dem = 0;
	s.checkLivenessIml(LivenessInfo);
	while (test.dem == 0) {
		Poco::Thread::sleep(50);
	}

	std::cout << "done" << std::endl;

	while (true) {

	}
}