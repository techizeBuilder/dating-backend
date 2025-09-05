import pkg from "agora-access-token";
const { RtcRole, RtcTokenBuilder } = pkg;

const appId = "0577357b75274dfaa0515383d8cfcc18";
const appCertificate = "0a669d1616944e4e810da99e187a1138";
const role = RtcRole.PUBLISHER;
const genrateRtcToken = (uid, channelName) => {
  // Validate UID is a number (convert if needed)
  const numericUid = Number(uid);
  if (isNaN(numericUid) || numericUid < 0 || numericUid > 4294967295) {
    throw new Error("Invalid UID");
  }

  // 24 hour token validity
  const expirationTimeInSeconds = 24 * 60 * 60;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

  console.log(
    `Generating token for UID: ${numericUid}, Channel: ${channelName}`
  );

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    numericUid,
    role,
    privilegeExpireTime
  );
};

export default genrateRtcToken;
