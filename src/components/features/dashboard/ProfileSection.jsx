import React from "react";
import { Card, Button, Descriptions, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { formatEducation, formatStudyPreference } from "./utils";

const { Paragraph, Text } = Typography;

const ProfileSection = ({ profileData, onEditProfile }) => {
  return (
    <Card
      className="profile-section-card content-card"
      title="Your Profile"
      bordered={false}
      extra={
        <Button onClick={onEditProfile} icon={<EditOutlined />}>
          Edit Profile
        </Button>
      }
    >
      {profileData ? (
        <Descriptions layout="horizontal" column={1} size="small">
          <Descriptions.Item label="Education Level">
            {formatEducation(profileData.education)}
          </Descriptions.Item>
          <Descriptions.Item label="Field of Study">
            {profileData.major || "Not specified"}
          </Descriptions.Item>
          <Descriptions.Item label="Interests">
            <Paragraph className="profile-text">
              {profileData.interests || "Not specified"}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Hobbies">
            <Paragraph className="profile-text">
              {profileData.hobbies || "Not specified"}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Study Preference">
            {formatStudyPreference(profileData.studyPreference)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div className="profile-incomplete">
          <Text type="secondary">
            Your profile is incomplete. Please complete your profile to get a
            personalized experience.
          </Text>
          <Button
            type="primary"
            className="complete-profile-btn"
            onClick={onEditProfile}
          >
            Complete Profile
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ProfileSection;
