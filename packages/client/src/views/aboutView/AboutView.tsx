import { Flex } from 'antd';
import './about-view.css';
import ColoredText from '@/components/coloredText/ColoredText';
import bitcoinStandard from '@assets/bookRecs/bitcoinStandard.webp';
import brokenMoney from '@assets/bookRecs/brokenMoney.webp';
import historyOfMoneyAndBanking from '@assets/bookRecs/historyOfMoneyAndBanking.webp';

export default function AboutView() {
  return (
    <Flex className="about-view-container" vertical align="center">
      <h1>
        {' '}
        <ColoredText color="var(--soft-orange)">About this site</ColoredText>
      </h1>

      <p color="white">
        This is mostly just a collection of little tools and visual-aids for my own learning. Maybe some day I'll add more stuff
        and build out a proper educational site for learning about the Bitcoin protocol.
        <br /> <br />
        For learning more about Bitcoin from a technical perspective, I highly reccomend going through{' '}
        <a href="https://learnmeabitcoin.com/" target="_blank">
          Learn Me a Bitcoin
        </a>
        . In terms of learning the nitty-gritty details of the protocol in a non-academic context, I havent found anything better.
        <br /> <br />
        For understanding Bitcoin from an economic perspective, I have found the following books to be great resources:
        <br /> <br />
        <Flex gap={16} justify="center" align="center">
          <img src={bitcoinStandard}></img>
          <img src={brokenMoney}></img>
          <img src={historyOfMoneyAndBanking}></img>
        </Flex>
      </p>
    </Flex>
  );
}
